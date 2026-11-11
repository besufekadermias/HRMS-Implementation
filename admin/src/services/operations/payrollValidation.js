import { cents } from "./payrollCalculations.js";

const PAYROLL_RESPONSE_ERROR =
  "Payroll records are incomplete or inconsistent. Please retry or contact support.";

function isNonEmptyText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isPayrollMonth(value) {
  return typeof value === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

function isTimestamp(value) {
  if (value === null) return true;
  return (
    typeof value === "string" &&
    /T.*(Z|[+-]\d{2}:\d{2})$/.test(value) &&
    !Number.isNaN(Date.parse(value))
  );
}

function isMoney(value) {
  if (typeof value !== "number") return false;
  try {
    cents(value);
    return true;
  } catch {
    // Invalid amounts are a failed validation, not a calculation to continue.
    return false;
  }
}

function hasUniqueValues(items, key) {
  const values = items.map((item) => item[key]);
  return new Set(values).size === items.length;
}

function isHistoryValid(entries) {
  if (!Array.isArray(entries)) return false;
  return entries.every(
    (entry) =>
      entry &&
      isNonEmptyText(entry.action) &&
      isNonEmptyText(entry.at) &&
      isTimestamp(entry.at) &&
      typeof entry.note === "string",
  );
}

export function validatePayrollPolicy(policy) {
  if (!policy) return false;
  const statuses = ["active", "inactive", "deleted"];
  if (!statuses.includes(policy.incomeTaxStatus)) return false;
  if (!statuses.includes(policy.pensionStatus)) return false;
  if (!isMoney(policy.pensionRate) || policy.pensionRate > 100) return false;
  if (!isMoney(policy.employerPensionRate) || policy.employerPensionRate > 100)
    return false;

  if (
    policy.incomeTaxDeduction !== undefined &&
    !validDeductionFields(policy.incomeTaxDeduction, true)
  )
    return false;
  if (
    policy.pensionDeduction !== undefined &&
    !validDeductionFields(policy.pensionDeduction)
  )
    return false;
  if (!Array.isArray(policy.taxBands) || !policy.taxBands.length) return false;

  return policy.taxBands.every((band, index, bands) => {
    if (
      !band ||
      !isMoney(band.offset) ||
      !isMoney(band.rate) ||
      band.rate > 100
    ) {
      return false;
    }
    if (index === bands.length - 1) {
      return band.upTo === null;
    }
    let previousCeiling = 0;
    if (index > 0) previousCeiling = bands[index - 1].upTo;
    return isMoney(band.upTo) && band.upTo > previousCeiling;
  });
}

export function validatePayrollResponse(data) {
  if (
    !data ||
    !Array.isArray(data.runs) ||
    !Array.isArray(data.deductions) ||
    !Array.isArray(data.monthlyPolicies) ||
    !validatePayrollPolicy(data.policy)
  ) {
    throw new Error(PAYROLL_RESPONSE_ERROR);
  }

  for (const entry of data.monthlyPolicies) {
    if (
      !entry ||
      !isPayrollMonth(entry.month) ||
      !validatePayrollPolicy(entry.policy) ||
      !isNonEmptyText(entry.updatedAt) ||
      !isTimestamp(entry.updatedAt) ||
      !isHistoryValid(entry.history)
    ) {
      throw new Error(PAYROLL_RESPONSE_ERROR);
    }
    const run = data.runs.find((item) => item?.month === entry.month);
    if (run && !samePolicy(run.policy, entry.policy)) {
      throw new Error(PAYROLL_RESPONSE_ERROR);
    }
  }

  for (const run of data.runs) {
    if (!isPayrollRunValid(run)) throw new Error(PAYROLL_RESPONSE_ERROR);
    for (const row of run.rows) {
      if (!isPayrollRowValid(row, run.policy))
        throw new Error(PAYROLL_RESPONSE_ERROR);
    }
    if (!hasUniqueValues(run.rows, "employeeId"))
      throw new Error(PAYROLL_RESPONSE_ERROR);
  }

  for (const deduction of data.deductions) {
    if (
      !deduction ||
      !isNonEmptyText(deduction.id) ||
      !isPayrollMonth(deduction.month) ||
      !validDeductionFields(deduction) ||
      typeof deduction.active !== "boolean" ||
      !isNonEmptyText(deduction.updatedAt) ||
      !isTimestamp(deduction.updatedAt) ||
      !isHistoryValid(deduction.history)
    ) {
      throw new Error(PAYROLL_RESPONSE_ERROR);
    }
  }

  if (
    !hasUniqueValues(data.runs, "id") ||
    !hasUniqueValues(data.runs, "month") ||
    !hasUniqueValues(data.deductions, "id") ||
    !hasUniqueValues(data.monthlyPolicies, "month")
  ) {
    throw new Error(PAYROLL_RESPONSE_ERROR);
  }
  return data;
}

function isPayrollRunValid(run) {
  if (!run || !isNonEmptyText(run.id) || !isPayrollMonth(run.month))
    return false;
  if (!["GENERATED", "FORWARDED_TO_FINANCE", "PAID"].includes(run.status))
    return false;
  if (!isTimestamp(run.generatedAt) || !isTimestamp(run.forwardedAt))
    return false;
  if (!Array.isArray(run.rows) || !run.rows.length) return false;
  if (!isHistoryValid(run.history) || typeof run.preparedBy !== "string")
    return false;
  return validatePayrollPolicy(run.policy);
}

function isPayrollRowValid(row, policy) {
  if (
    !row ||
    ![row.employeeId, row.employeeName, row.department].every(isNonEmptyText)
  ) {
    return false;
  }
  const amountFields = [
    "gross",
    "incomeTax",
    "pension",
    "employerPension",
    "otherDeductions",
    "net",
  ];
  for (const field of amountFields) {
    if (!isMoney(row[field])) return false;
  }
  if (!Array.isArray(row.deductionItems)) return false;

  const totalDeductions =
    cents(row.incomeTax) + cents(row.pension) + cents(row.otherDeductions);
  if (cents(row.gross) !== totalDeductions + cents(row.net)) return false;
  if (policy.incomeTaxStatus !== "active" && row.incomeTax !== 0) return false;
  if (policy.pensionStatus !== "active" && row.pension !== 0) return false;

  const validItems = row.deductionItems.every(
    (item) =>
      item &&
      isNonEmptyText(item.id) &&
      isNonEmptyText(item.name) &&
      isMoney(item.amount),
  );
  if (!validItems || !hasUniqueValues(row.deductionItems, "id")) return false;
  let otherDeductions = 0;
  for (const item of row.deductionItems) {
    otherDeductions += cents(item.amount);
  }
  return otherDeductions === cents(row.otherDeductions);
}

function samePolicy(left, right) {
  if (!validatePayrollPolicy(left)) return false;
  const fields = [
    "incomeTaxStatus",
    "pensionStatus",
    "pensionRate",
    "employerPensionRate",
  ];
  for (const field of fields) {
    if (left[field] !== right[field]) return false;
  }
  if (!sameDeductionFields(left.incomeTaxDeduction, right.incomeTaxDeduction))
    return false;
  if (!sameDeductionFields(left.pensionDeduction, right.pensionDeduction))
    return false;
  if (left.taxBands.length !== right.taxBands.length) return false;
  return left.taxBands.every((band, index) => {
    const otherBand = right.taxBands[index];
    return (
      band.upTo === otherBand.upTo &&
      band.rate === otherBand.rate &&
      band.offset === otherBand.offset
    );
  });
}

function validDeductionFields(item, allowAutomatic = false) {
  if (
    !item ||
    !isNonEmptyText(item.name) ||
    item.name.length > 80 ||
    !isNonEmptyText(item.description) ||
    item.description.length > 300
  )
    return false;
  if (!["all", "selected"].includes(item.appliesTo)) return false;
  if (
    !Array.isArray(item.employeeIds) ||
    !item.employeeIds.every(isNonEmptyText)
  )
    return false;
  if (new Set(item.employeeIds).size !== item.employeeIds.length) return false;

  if (item.appliesTo === "all") {
    if (item.employeeIds.length !== 0) return false;
  } else if (!item.employeeIds.length) {
    return false;
  }
  if (allowAutomatic && item.kind === "automatic") return item.value === null;
  if (!["fixed", "percent"].includes(item.kind)) return false;
  if (!isMoney(item.value) || item.value <= 0) return false;
  if (item.kind === "percent" && item.value > 100) return false;
  return true;
}

function sameDeductionFields(left, right) {
  if (!left || !right) return left === right;
  const fields = ["name", "description", "kind", "value", "appliesTo"];
  for (const field of fields) {
    if (left[field] !== right[field]) return false;
  }
  if (left.employeeIds.length !== right.employeeIds.length) return false;
  return left.employeeIds.every((id) => right.employeeIds.includes(id));
}
