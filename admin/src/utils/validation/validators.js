import {
  DEPARTMENTS,
  JOB_GRADES,
  EMPLOYEE_STATUSES,
  EMPLOYMENT_TYPES,
  PORTAL_ROLES,
} from "../constants/constants.js";

export function todayInNairobi() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  return ["year", "month", "day"]
    .map((type) => parts.find((part) => part.type === type).value)
    .join("-");
}

export function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

// Validate employee form fields before submission.
export function validateEmployee(
  values,
  employees = [],
  originalId = null,
  { importMode = false, departments = DEPARTMENTS, grades = JOB_GRADES } = {},
) {
  const errors = {};
  const id = (values.id || "").trim();
  const name = (values.name || "").trim();
  const login = (values.email || "").trim();
  const others = employees.filter((employee) => employee.id !== originalId);
  if (!/^[a-zA-Z0-9_-]{1,30}$/.test(id))
    errors.id = "Use 1–30 letters, numbers, hyphens, or underscores.";
  else if (
    others.some((employee) => employee.id.toLowerCase() === id.toLowerCase())
  )
    errors.id = "This employee ID is already in use.";
  if (name.length < 2 || name.length > 100)
    errors.name = "Enter a full name of 2–100 characters.";
  if (
    !login ||
    login.length > 120 ||
    /\s/.test(login) ||
    (login.includes("@") && !/^[^@]+@[^@]+\.[^@]+$/.test(login))
  )
    errors.email = "Enter an email address or a login ID without spaces.";
  else if (
    others.some(
      (employee) => employee.email?.toLowerCase() === login.toLowerCase(),
    )
  )
    errors.email = "This email or login ID is already in use.";
  if (!departments.includes(values.department))
    errors.department = "Select a department.";
  if (!grades.some((grade) => grade.name === values.grade))
    errors.grade = "Select a civil job grade.";
  if (
    !isValidDate(values.hiredDate) ||
    values.hiredDate < "1900-01-01" ||
    values.hiredDate > "2100-12-31"
  )
    errors.hiredDate = "Enter a valid hired date.";
  if (values.status && !EMPLOYEE_STATUSES.includes(values.status))
    errors.status = "Select a supported employment status.";
  if (!importMode) {
    if (!["Male", "Female", "Other"].includes(values.gender))
      errors.gender = "Select a gender.";
    if (
      !isValidDate(values.birthDate) ||
      values.birthDate < "1900-01-01" ||
      values.birthDate > todayInNairobi()
    )
      errors.birthDate = "Enter a valid birth date that is not in the future.";
    else if (
      isValidDate(values.hiredDate) &&
      values.hiredDate < values.birthDate
    )
      errors.hiredDate = "Hired date cannot be before birth date.";
    if (!EMPLOYMENT_TYPES.includes(values.employmentType))
      errors.employmentType = "Select an employment type.";
    if (!PORTAL_ROLES.includes(values.portalRole))
      errors.portalRole = "Select a portal role.";
    if (!originalId && (values.temporaryPassword || "").length < 8)
      errors.temporaryPassword = "Use at least 8 characters.";
  }
  return errors;
}

export function validateDepartment(values, departments, employees) {
  const errors = {};
  const name = (values.name || "").trim();
  const code = (values.code || "").trim();
  const others = departments.filter(
    (department) => department.id !== values.id,
  );
  if (name.length < 2 || name.length > 120)
    errors.name = "Enter a department name of 2–120 characters.";
  else if (
    others.some(
      (department) => department.name.toLowerCase() === name.toLowerCase(),
    )
  )
    errors.name = "A department with this name already exists.";
  if (!/^[a-zA-Z0-9-]{2,12}$/.test(code))
    errors.code = "Use 2–12 letters, numbers, or hyphens.";
  else if (
    others.some(
      (department) => department.code.toLowerCase() === code.toLowerCase(),
    )
  )
    errors.code = "This department code is already in use.";
  if ((values.description || "").trim().length > 300)
    errors.description = "Keep the description within 300 characters.";
  if (!["Active", "Inactive"].includes(values.status))
    errors.status = "Select Active or Inactive.";
  const original = departments.find(
    (department) => department.id === values.id,
  );
  if (
    values.headId &&
    !employees.some(
      (employee) =>
        employee.id === values.headId && employee.department === original?.name,
    )
  )
    errors.headId = "Choose an employee assigned to this department.";
  return errors;
}

export function validateJobGrade(values, grades) {
  const errors = {};
  const name = (values.name || "").trim().replace(/\s+/g, " ");
  const salaryText = String(values.salary ?? "").trim();
  const salary = Number(salaryText);
  if (name.length < 2 || name.length > 80)
    errors.name = "Enter a grade title of 2–80 characters.";
  else if (
    grades.some(
      (grade) =>
        grade.id !== values.id &&
        grade.name.toLowerCase() === name.toLowerCase(),
    )
  )
    errors.name = "A grade with this title already exists.";
  if (
    !/^\d+(\.\d{1,2})?$/.test(salaryText) ||
    !Number.isFinite(salary) ||
    salary <= 0 ||
    salary > 999999999.99
  )
    errors.salary =
      "Enter a salary from ETB 0.01 to 999,999,999.99, with no more than two decimal places.";
  return errors;
}
