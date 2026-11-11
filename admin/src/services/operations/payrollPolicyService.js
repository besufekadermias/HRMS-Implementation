import {
  calculatePayrollRow,
  cents,
  getPayrollPolicy,
  getPolicyDeduction,
} from "./payrollCalculations.js";
import { validatePayrollMonth } from "./payrollService.js";
import { validatePayrollPolicy } from "./payrollValidation.js";
import { normalizeDeductionFields } from "./payrollDeductionFields.js";

export function changePayrollPolicyDeduction(
  data,
  employees,
  input,
  now = new Date(),
) {
  const { month, type, action } = input;
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Addis_Ababa",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  validatePayrollMonth(month, today);
  const run = data.runs.find((item) => item.month === month);
  if (run && run.status !== "GENERATED")
    throw new Error(
      "Deductions for payroll already forwarded to Finance or paid are locked.",
    );
  if (!["incomeTax", "pension"].includes(type))
    throw new Error("Choose Income Tax or Pension Contribution.");
  if (!["edit", "deactivate", "reactivate", "delete"].includes(action))
    throw new Error("Choose a valid deduction action.");

  const policy = structuredClone(getPayrollPolicy(data, month));
  const statusKey = type === "incomeTax" ? "incomeTaxStatus" : "pensionStatus";
  if (policy[statusKey] === "deleted")
    throw new Error("This deduction has been deleted for this month.");

  if (action === "edit") {
    const { active, ...fields } = normalizeDeductionFields(
      input,
      employees,
      run,
      type === "incomeTax",
    );
    const otherType = type === "incomeTax" ? "pension" : "incomeTax";
    const other = getPolicyDeduction(policy, otherType);
    const duplicates = data.deductions.filter((item) => item.month === month);
    if (other.status !== "deleted") duplicates.push(other);
    if (
      duplicates.some(
        (item) => item.name.toLowerCase() === fields.name.toLowerCase(),
      )
    )
      throw new Error(
        "A deduction with this name already exists for the month.",
      );
    policy[`${type}Deduction`] = fields;
    policy[statusKey] = active ? "active" : "inactive";
  } else {
    const statuses = {
      deactivate: "inactive",
      reactivate: "active",
      delete: "deleted",
    };
    policy[statusKey] = statuses[action];
  }
  if (!validatePayrollPolicy(policy))
    throw new Error(
      "The payroll deduction is invalid. Check its amount and employee selection.",
    );

  const at = now.toISOString();
  const entry = {
    action: `POLICY_DEDUCTION_${action.toUpperCase()}`,
    at,
    note: getPolicyDeduction(policy, type).name,
  };
  const previous = data.monthlyPolicies.find((item) => item.month === month);
  const monthlyPolicy = {
    month,
    policy,
    updatedAt: at,
    history: [...(previous?.history || []), entry],
  };
  // Change only this deduction and net; keep every other recorded amount intact.
  const runs = data.runs.map((item) => {
    if (item.month !== month) return item;
    return updateRunPolicyDeduction(item, policy, type, entry);
  });
  return {
    ...data,
    runs,
    monthlyPolicies: [
      ...data.monthlyPolicies.filter((item) => item.month !== month),
      monthlyPolicy,
    ],
  };
}

function updateRunPolicyDeduction(run, policy, type, historyEntry) {
  const rows = [];
  for (const row of run.rows) {
    const savedEmployee = {
      id: row.employeeId,
      name: row.employeeName,
      department: row.department,
      basicSalary: row.gross,
    };
    const calculated = calculatePayrollRow(savedEmployee, [], policy);
    const net = cents(row.net) + cents(row[type]) - cents(calculated[type]);
    if (net < 0) {
      throw new Error(
        `Deductions exceed the gross salary for ${row.employeeName}. Reduce the deduction.`,
      );
    }
    rows.push({ ...row, [type]: calculated[type], net: net / 100 });
  }
  return {
    ...run,
    policy: structuredClone(policy),
    rows,
    history: [...run.history, historyEntry],
  };
}
