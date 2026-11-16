import { deductionSchema } from '../../utils/validation/operationsSchemas.js';
import { validateInput } from '../../utils/validation/schemaHelpers.js';
import { cents } from "./payrollCalculations.js";

// Shared by Add/Edit Deduction and the tax/pension editor.
export function normalizeDeductionFields(
  values,
  employees,
  run,
  allowAutomatic = false,
) {
  validateInput(deductionSchema, values);
  const name = values.name.trim();
  const description = values.description.trim();
  const isAutomatic = allowAutomatic && values.kind === "automatic";
  if (!isAutomatic && !["fixed", "percent"].includes(values.kind)) {
    throw new Error("Choose an amount or percentage.");
  }
  let value = null;
  if (!isAutomatic) {
    if (!/^\d+(\.\d{1,2})?$/.test(String(values.value))) {
      throw new Error(
        "Enter a positive amount or percentage with up to two decimal places.",
      );
    }
    value = cents(values.value) / 100;
    if (!value || (values.kind === "percent" && value > 100)) {
      throw new Error(
        "The deduction must be positive; percentages cannot exceed 100%.",
      );
    }
  }
  // Saved payroll employees remain selectable after leaving the current roster.
  const availableIds = new Set();
  for (const employee of employees) availableIds.add(employee.id);
  for (const row of run?.rows || []) availableIds.add(row.employeeId);

  let employeeIds = [];
  if (values.appliesTo === "selected") {
    employeeIds = [...new Set(values.employeeIds)];
    if (
      !employeeIds.length ||
      employeeIds.some((id) => !availableIds.has(id))
    ) {
      throw new Error("Select at least one available employee.");
    }
  }
  return {
    name,
    description,
    kind: values.kind,
    value,
    appliesTo: values.appliesTo,
    employeeIds,
    active: values.active,
  };
}
