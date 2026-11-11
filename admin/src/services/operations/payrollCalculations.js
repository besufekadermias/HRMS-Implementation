import { PAYROLL_POLICY_DEDUCTIONS } from "../../utils/constants/constants.js";

// Monetary operations use integer cents, then return ETB for display/API data.
export function cents(value) {
  const amount = Number(value);
  const result = Math.round(amount * 100);
  if (
    !["number", "string"].includes(typeof value) ||
    String(value).trim() === "" ||
    !Number.isFinite(amount) ||
    amount < 0 ||
    !Number.isSafeInteger(result) ||
    Math.abs(amount * 100 - result) > 0.00001
  ) {
    throw new Error(
      "Amounts must be positive numbers or zero, with at most two decimal places.",
    );
  }
  return result;
}

// Saved runs take precedence; ungenerated months can also have edited rules.
export function getPayrollPolicy(data, month) {
  const savedRun = data.runs.find((run) => run.month === month);
  if (savedRun?.policy) return savedRun.policy;
  const monthlyPolicy = data.monthlyPolicies.find(
    (item) => item.month === month,
  );
  if (monthlyPolicy?.policy) return monthlyPolicy.policy;
  return data.policy;
}

export function getPolicyDeduction(policy, type) {
  let status = policy.pensionStatus;
  let value = null;
  if (type === "incomeTax") status = policy.incomeTaxStatus;
  if (type === "pension") value = policy.pensionRate;
  return {
    ...PAYROLL_POLICY_DEDUCTIONS[type],
    value,
    appliesTo: "all",
    employeeIds: [],
    ...policy[`${type}Deduction`],
    type,
    status,
    active: status === "active",
  };
}

function deductionCents(gross, employeeId, deduction, automaticAmount = 0) {
  if (
    !deduction.active ||
    (deduction.appliesTo === "selected" &&
      !deduction.employeeIds.includes(employeeId))
  ) {
    return 0;
  }
  if (deduction.kind === "automatic") return automaticAmount;
  if (deduction.kind === "percent") {
    return Math.round((gross * deduction.value) / 100);
  }
  return cents(deduction.value);
}

export function calculatePayrollRow(employee, deductions, policy) {
  const gross = cents(employee.basicSalary);
  if (!gross) {
    throw new Error(
      `Set a basic salary for ${employee.name} before generating payroll.`,
    );
  }
  const band = policy.taxBands.find(
    (item) => item.upTo === null || gross <= cents(item.upTo),
  );
  if (!band) {
    throw new Error("The income tax schedule does not cover this salary.");
  }
  const incomeTax = deductionCents(
    gross,
    employee.id,
    getPolicyDeduction(policy, "incomeTax"),
    Math.max(0, Math.round((gross * band.rate) / 100) - cents(band.offset)),
  );
  const pension = deductionCents(
    gross,
    employee.id,
    getPolicyDeduction(policy, "pension"),
  );
  const employerPension = Math.round(
    (gross * policy.employerPensionRate) / 100,
  );
  const deductionItems = [];
  let otherDeductions = 0;
  for (const deduction of deductions) {
    if (!deduction.active) continue;
    if (
      deduction.appliesTo !== "all" &&
      !deduction.employeeIds.includes(employee.id)
    )
      continue;
    const amount = deductionCents(gross, employee.id, deduction) / 100;
    deductionItems.push({ id: deduction.id, name: deduction.name, amount });
    otherDeductions += cents(amount);
  }
  const net = gross - incomeTax - pension - otherDeductions;
  if (net < 0) {
    throw new Error(
      `Deductions exceed the gross salary for ${employee.name}. Reduce the other deductions.`,
    );
  }
  return {
    employeeId: employee.id,
    employeeName: employee.name,
    department: employee.department,
    gross: gross / 100,
    incomeTax: incomeTax / 100,
    pension: pension / 100,
    employerPension: employerPension / 100,
    otherDeductions: otherDeductions / 100,
    net: net / 100,
    deductionItems,
  };
}

export function summarizePayroll(run) {
  const totals = {
    gross: 0,
    incomeTax: 0,
    pension: 0,
    employerPension: 0,
    otherDeductions: 0,
    net: 0,
  };
  for (const row of run?.rows || []) {
    for (const key of Object.keys(totals)) {
      totals[key] += cents(row[key]);
    }
  }
  for (const key of Object.keys(totals)) {
    totals[key] /= 100;
  }
  return {
    ...totals,
    totalDeductions:
      (cents(totals.incomeTax) +
        cents(totals.pension) +
        cents(totals.otherDeductions)) /
      100,
    employees: run?.rows.length || 0,
  };
}

export function filterPayrollRows(rows, search = "") {
  const query = search.trim().toLowerCase();
  return rows.filter((row) =>
    [row.employeeName, row.employeeId, row.department].some((value) =>
      value.toLowerCase().includes(query),
    ),
  );
}

export function departmentPayroll(run) {
  const groups = new Map();
  for (const row of run?.rows || []) {
    groups.set(
      row.department,
      (groups.get(row.department) || 0) + cents(row.gross),
    );
  }
  return [...groups].map(([name, amount]) => ({ name, amount: amount / 100 }));
}

export function monthLabel(month, short = false) {
  return new Date(`${month}-01T12:00:00Z`).toLocaleDateString("en-GB", {
    month: short ? "short" : "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function payrollMonths(runs, today) {
  const date = new Date(`${today.slice(0, 7)}-01T12:00:00Z`);
  const months = new Set(runs.map((run) => run.month));
  for (let index = 0; index < 24; index++) {
    months.add(date.toISOString().slice(0, 7));
    date.setUTCMonth(date.getUTCMonth() - 1);
  }
  return [...months].sort().reverse();
}
