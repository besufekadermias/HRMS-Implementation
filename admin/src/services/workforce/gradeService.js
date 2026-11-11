import { validateJobGrade } from "../../utils/validation/validators.js";

// Keep job grades and assigned employee salaries consistent.
export function saveJobGrade(grades, employees, values) {
  const errors = validateJobGrade(values, grades);
  if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
  const original = grades.find((grade) => grade.id === values.id);
  if (values.id != null && !original) throw new Error("Job grade not found.");
  const grade = {
    id: original?.id ?? Math.max(0, ...grades.map((item) => item.id)) + 1,
    name: values.name.trim().replace(/\s+/g, " "),
    salary: Math.round(Number(values.salary) * 100) / 100,
  };
  return {
    grade,
    grades: original
      ? grades.map((item) => (item.id === original.id ? grade : item))
      : [...grades, grade],
    employees: original
      ? employees.map((employee) =>
          employee.grade === original.name
            ? { ...employee, grade: grade.name, basicSalary: grade.salary }
            : employee,
        )
      : employees,
  };
}

export function deleteJobGrade(grades, employees, id) {
  const grade = grades.find((item) => item.id === id);
  if (!grade) throw new Error("Job grade not found.");
  if (employees.some((employee) => employee.grade === grade.name))
    throw new Error("Reassign this grade’s employees before deleting it.");
  return grades.filter((item) => item.id !== id);
}
