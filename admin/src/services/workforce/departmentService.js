import { validateDepartment } from "../../utils/validation/validators.js";

// Keep department assignments and employee records consistent.
export function saveDepartment(departments, employees, values) {
  const errors = validateDepartment(values, departments, employees);
  if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
  const original = departments.find(
    (department) => department.id === values.id,
  );
  if (values.id != null && !original) throw new Error("Department not found.");
  const department = {
    id: original?.id ?? Math.max(0, ...departments.map((item) => item.id)) + 1,
    name: values.name.trim(),
    code: values.code.trim().toUpperCase(),
    description: (values.description || "").trim(),
    headId: values.headId || "",
    status: values.status,
  };
  return {
    department,
    departments: original
      ? departments.map((item) => (item.id === original.id ? department : item))
      : [...departments, department],
    employees: original
      ? employees.map((employee) =>
          employee.department === original.name
            ? { ...employee, department: department.name }
            : employee,
        )
      : employees,
  };
}

export function deleteDepartment(departments, employees, id) {
  const department = departments.find((item) => item.id === id);
  if (!department) throw new Error("Department not found.");
  if (employees.some((employee) => employee.department === department.name))
    throw new Error(
      "Move this department’s employees to another department before deleting it.",
    );
  return departments.filter((item) => item.id !== id);
}

// Keep head assignments valid after an employee is moved, renamed, or deleted.
export function reconcileDepartmentHeads(
  departments,
  employees,
  originalId,
  nextId,
) {
  return departments.map((department) => {
    const headId =
      originalId && department.headId === originalId
        ? nextId
        : department.headId;
    return {
      ...department,
      headId: employees.some(
        (employee) =>
          employee.id === headId && employee.department === department.name,
      )
        ? headId
        : "",
    };
  });
}
