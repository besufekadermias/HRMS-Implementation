import {
  isValidDate,
  todayInNairobi,
} from "../../utils/validation/validators.js";

export const SANCTIONS = [
  { value: "WARNING", label: "Warning" },
  { value: "FINE", label: "Fine" },
  { value: "SUSPENSION", label: "Suspension" },
  { value: "TERMINATION", label: "Termination" },
];

// Neutral demo incident; the reference supplies the layout, not verified allegations.
export const INITIAL_DISCIPLINE = {
  records: [
    {
      id: "DR-001",
      employeeId: "HD-IT-001",
      employeeName: "Sisay Kebede",
      department: "Hadiya Science Information Technology",
      incidentDate: "2026-10-22",
      violationType: "Unauthorized absence",
      penaltyAction: "FINE",
      description: "Sample record for demonstration.",
    },
  ],
  history: [],
};

export function validateDisciplinaryAction(
  values,
  employees,
  today = todayInNairobi(),
) {
  const errors = {};
  if (!employees.some((employee) => employee.id === values.employeeId))
    errors.employeeId = "Select an employee from the current staff list.";
  if (
    !isValidDate(values.incidentDate) ||
    values.incidentDate < "1900-01-01" ||
    values.incidentDate > today
  )
    errors.incidentDate = "Enter a valid incident date on or before today.";
  if (!values.violationType?.trim() || values.violationType.trim().length > 100)
    errors.violationType = "Enter a violation type of 1–100 characters.";
  if (!SANCTIONS.some((sanction) => sanction.value === values.penaltyAction))
    errors.penaltyAction = "Select a sanction or penalty action.";
  if ((values.description || "").length > 5000)
    errors.description = "Keep the explanation within 5,000 characters.";
  return errors;
}

function historyEntry(action, record, at, reason = "") {
  return { id: crypto.randomUUID(), action, at, reason, record: { ...record } };
}

export function recordDisciplinaryAction(
  data,
  employees,
  values,
  { today = todayInNairobi(), at = new Date().toISOString() } = {},
) {
  const errors = validateDisciplinaryAction(values, employees, today);
  if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
  const employee = employees.find((item) => item.id === values.employeeId);
  const record = {
    id: crypto.randomUUID(),
    employeeId: employee.id,
    employeeName: employee.name,
    department: employee.department,
    incidentDate: values.incidentDate,
    violationType: values.violationType.trim(),
    penaltyAction: values.penaltyAction,
    description: (values.description || "").trim(),
  };
  return {
    records: [record, ...data.records],
    history: [historyEntry("Recorded", record, at), ...data.history],
  };
}

export function deleteDisciplinaryAction(
  data,
  id,
  at = new Date().toISOString(),
) {
  const record = data.records.find((item) => item.id === id);
  if (!record)
    throw new Error("This disciplinary record has already been removed.");
  return {
    records: data.records.filter((item) => item.id !== id),
    history: [historyEntry("Deleted", record, at), ...data.history],
  };
}

export function remapDisciplineEmployee(data, originalId, nextId) {
  return {
    ...data,
    records: data.records.map((record) =>
      record.employeeId === originalId
        ? { ...record, employeeId: nextId }
        : record,
    ),
  };
}

export function removeEmployeeDiscipline(
  data,
  employeeId,
  at = new Date().toISOString(),
) {
  const removed = data.records.filter(
    (record) => record.employeeId === employeeId,
  );
  return {
    records: data.records.filter((record) => record.employeeId !== employeeId),
    history: [
      ...removed.map((record) =>
        historyEntry("Deleted", record, at, "Employee removed"),
      ),
      ...data.history,
    ],
  };
}

export function disciplineRows(records, employees, search = "") {
  const roster = new Map(employees.map((employee) => [employee.id, employee]));
  const query = search.trim().toLowerCase();
  return records
    .map((record) => ({
      ...record,
      employeeName: roster.get(record.employeeId)?.name || record.employeeName,
      department:
        roster.get(record.employeeId)?.department || record.department,
      sanctionLabel:
        SANCTIONS.find((sanction) => sanction.value === record.penaltyAction)
          ?.label || record.penaltyAction,
    }))
    .filter((record) =>
      [
        record.employeeId,
        record.employeeName,
        record.department,
        record.incidentDate,
        record.violationType,
        record.sanctionLabel,
        record.description,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query),
      ),
    )
    .sort((a, b) => b.incidentDate.localeCompare(a.incidentDate));
}
