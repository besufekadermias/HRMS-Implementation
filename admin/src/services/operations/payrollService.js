import {
  isValidDate,
  todayInNairobi,
} from "../../utils/validation/validators.js";
import {
  calculatePayrollRow,
  cents,
  getPayrollPolicy,
  getPolicyDeduction,
} from "./payrollCalculations.js";
import { normalizeDeductionFields } from "./payrollDeductionFields.js";

export function validatePayrollMonth(month, today = todayInNairobi()) {
  if (
    !/^\d{4}-(0[1-9]|1[0-2])$/.test(month || "") ||
    !isValidDate(`${month}-01`)
  )
    throw new Error("Choose a valid payroll month.");
  if (month > today.slice(0, 7))
    throw new Error(
      "Payroll can be generated for the current month or an earlier month.",
    );
}

export function generatePayroll(
  data,
  employees,
  { month, regenerate = false },
  now = new Date(),
) {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Addis_Ababa",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  validatePayrollMonth(month, today);
  const previous = data.runs.find((run) => run.month === month);
  if (previous && previous.status !== "GENERATED")
    throw new Error(
      "Payroll already forwarded to Finance or paid cannot be regenerated.",
    );
  if (previous && !regenerate)
    throw new Error(
      "Payroll already exists for this month. Use Regenerate Payroll to update it.",
    );
  const eligible = employees.filter((employee) =>
    ["Active", "On Leave"].includes(employee.status),
  );
  if (eligible.some((employee) => !isValidDate(employee.hiredDate)))
    throw new Error("Correct employee hire dates before generating payroll.");
  const staff = eligible.filter(
    (employee) => employee.hiredDate.slice(0, 7) <= month,
  );
  if (!staff.length)
    throw new Error("There are no eligible employees for this payroll month.");
  const deductions = data.deductions.filter((item) => item.month === month);
  const policy = getPayrollPolicy(data, month);
  const rows = staff.map((employee) =>
    calculatePayrollRow(employee, deductions, policy),
  );
  const at = now.toISOString();
  const run = {
    id: previous?.id || `PR-${month}`,
    month,
    status: "GENERATED",
    generatedAt: at,
    forwardedAt: null,
    preparedBy: "",
    policy: structuredClone(policy),
    rows,
    history: [
      ...(previous?.history || []),
      {
        action: previous ? "REGENERATED" : "GENERATED",
        at,
        note: `${rows.length} employees included`,
      },
    ],
  };
  return {
    ...data,
    runs: [...data.runs.filter((item) => item.month !== month), run].sort(
      (a, b) => b.month.localeCompare(a.month),
    ),
  };
}

export function savePayrollDeduction(
  data,
  employees,
  values,
  now = new Date(),
) {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Addis_Ababa",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  validatePayrollMonth(values.month, today);
  const run = data.runs.find((item) => item.month === values.month);
  if (run && run.status !== "GENERATED")
    throw new Error(
      "Deductions for payroll already forwarded to Finance or paid are locked.",
    );
  let original = null;
  if (values.id) {
    original = data.deductions.find((item) => item.id === values.id);
  }
  if (values.id && !original)
    throw new Error("This deduction is no longer available.");
  if (original && original.month !== values.month)
    throw new Error("The deduction month cannot be changed.");
  const fields = normalizeDeductionFields(values, employees, run);
  const { name, description } = fields;
  const policy = getPayrollPolicy(data, values.month);
  const builtInDeductions = ["incomeTax", "pension"].map((type) =>
    getPolicyDeduction(policy, type),
  );
  if (
    builtInDeductions.some(
      (item) =>
        item.status !== "deleted" &&
        item.name.toLowerCase() === name.toLowerCase(),
    ) ||
    data.deductions.some(
      (item) =>
        item.id !== values.id &&
        item.month === values.month &&
        item.name.toLowerCase() === name.toLowerCase(),
    )
  ) {
    throw new Error("A deduction with this name already exists for the month.");
  }
  const at = now.toISOString();
  const deduction = {
    id: original?.id || crypto.randomUUID(),
    month: values.month,
    ...fields,
    updatedAt: at,
    history: [
      ...(original?.history || []),
      { action: original ? "UPDATED" : "CREATED", at, note: description },
    ],
  };
  const deductions = [
    ...data.deductions.filter((item) => item.id !== deduction.id),
    deduction,
  ];
  // Existing generated runs retain salary/name snapshots; only deductions change.
  const monthlyDeductions = deductions.filter(
    (deduction) => deduction.month === values.month,
  );
  const runs = data.runs.map((item) => {
    if (item.month !== values.month) return item;
    return recalculateRunDeductions(item, monthlyDeductions, at, name);
  });
  return { ...data, deductions, runs };
}

function recalculateRunDeductions(run, deductions, at, deductionName) {
  const rows = [];
  for (const row of run.rows) {
    const savedEmployee = {
      id: row.employeeId,
      name: row.employeeName,
      department: row.department,
      basicSalary: row.gross,
    };
    rows.push(calculatePayrollRow(savedEmployee, deductions, run.policy));
  }
  return {
    ...run,
    rows,
    history: [
      ...run.history,
      { action: "DEDUCTIONS_UPDATED", at, note: deductionName },
    ],
  };
}

export function deletePayrollDeduction(data, { id, month }, now = new Date()) {
  const deduction = data.deductions.find((item) => item.id === id);
  if (!deduction) throw new Error("This deduction is no longer available.");
  if (deduction.month !== month)
    throw new Error(
      "The deduction month does not match. Reload payroll and try again.",
    );
  const run = data.runs.find((item) => item.month === month);
  if (run && run.status !== "GENERATED") {
    throw new Error(
      "Deductions for payroll already forwarded to Finance or paid are locked.",
    );
  }

  // Restore only the deleted deduction's saved amount; other salary/tax snapshots stay intact.
  const runs = data.runs.map((item) => {
    if (item.month !== month) return item;
    const rows = [];
    for (const row of item.rows) {
      const removed = row.deductionItems.find((entry) => entry.id === id);
      let removedAmount = 0;
      if (removed) removedAmount = cents(removed.amount);
      rows.push({
        ...row,
        deductionItems: row.deductionItems.filter((entry) => entry.id !== id),
        otherDeductions: (cents(row.otherDeductions) - removedAmount) / 100,
        net: (cents(row.net) + removedAmount) / 100,
      });
    }
    return {
      ...item,
      rows,
      history: [
        ...item.history,
        {
          action: "DEDUCTION_DELETED",
          at: now.toISOString(),
          note: deduction.name,
        },
      ],
    };
  });
  return {
    ...data,
    runs,
    deductions: data.deductions.filter((item) => item.id !== id),
  };
}
