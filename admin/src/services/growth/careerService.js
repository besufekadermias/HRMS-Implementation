import { MILESTONE_TYPES, careerMilestoneSchema } from '../../utils/validation/growthSchemas.js';
import { fieldErrors } from '../../utils/validation/schemaHelpers.js';
import { todayInNairobi } from "../../utils/validation/validators.js";

export { MILESTONE_TYPES };

// Historical example from careertracking.png; already reflected in the roster.
export const INITIAL_CAREER_MILESTONES = [
  {
    id: "CM-001",
    employeeId: "2121",
    employeeName: "Tsedeke Wondimu",
    milestoneType: "GRADE_CHANGE",
    previousGradeId: null,
    previousGradeName: "",
    newGradeId: 7,
    newGradeName: "Grade IV",
    newSalary: 24000,
    effectiveDate: "2026-10-27",
    status: "APPLIED",
    description: "He is such a honorable manger and important for our office",
  },
];

function gradeById(grades, id) {
  return grades.find((grade) => String(grade.id) === String(id));
}

function salary(value) {
  return Math.round(Number(value) * 100) / 100;
}

function validSalary(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 && amount <= 999999999.99;
}

export function latestCareerGradeDate(milestones, employeeId) {
  let latestDate = "";
  for (const milestone of milestones) {
    if (
      milestone.employeeId !== employeeId ||
      milestone.newGradeId == null ||
      milestone.status !== "APPLIED"
    )
      continue;
    if (milestone.effectiveDate > latestDate)
      latestDate = milestone.effectiveDate;
  }
  return latestDate;
}

export function careerChangeContext(
  values,
  milestones,
  employees,
  grades,
  today = todayInNairobi(),
) {
  const employee = employees.find((item) => item.id === values.employeeId);
  const currentGrade = grades.find((grade) => grade.name === employee?.grade);
  const previousGrade = gradeById(grades, values.previousGradeId);
  const newGrade = gradeById(grades, values.newGradeId);
  const historical =
    !!employee &&
    !!newGrade &&
    values.effectiveDate < latestCareerGradeDate(milestones, employee.id);
  return {
    employee,
    currentGrade,
    previousGrade,
    newGrade,
    historical,
    scheduled: values.effectiveDate > today,
  };
}

export function validateCareerMilestone(
  values,
  milestones,
  employees,
  grades,
  today = todayInNairobi(),
) {
  return validateCareerMilestoneRules(values, milestones, employees, grades, today, fieldErrors(careerMilestoneSchema, values));
}

export function validateCareerMilestoneRules(values, milestones, employees, grades, today = todayInNairobi(), errors = {}) {
  if (!values || typeof values !== 'object') return errors;
  const { employee, previousGrade, newGrade, historical } = careerChangeContext(
    values,
    milestones,
    employees,
    grades,
    today,
  );
  if (!employee)
    errors.employeeId = "Select an employee from the current staff list.";
  if (values.previousGradeId && !previousGrade)
    errors.previousGradeId = "Select an available previous grade.";
  if (
    (!newGrade && values.milestoneType !== "AWARD_MILESTONE") ||
    (values.newGradeId && !newGrade)
  ) {
    errors.newGradeId = "Select the configured grade or step for this change.";
  } else if (newGrade && !validSalary(newGrade.salary)) {
    errors.newGradeId =
      "This grade needs a valid base salary in Grades & Scales.";
  } else if (newGrade && employee) {
    let baselineGrade = employee.grade;
    let baselineSalary = employee.basicSalary;
    if (historical) {
      baselineGrade = previousGrade?.name;
      baselineSalary = previousGrade?.salary;
    }
    if (
      values.milestoneType === "STEP_INCREMENT" &&
      baselineSalary != null &&
      salary(newGrade.salary) <= salary(baselineSalary)
    ) {
      errors.newGradeId =
        "Select a grade or step with a higher configured base salary.";
    } else if (
      newGrade.name === baselineGrade &&
      salary(newGrade.salary) === salary(baselineSalary)
    ) {
      errors.newGradeId =
        "Choose a different grade or a configured salary change.";
    }
    if (!historical && previousGrade && previousGrade.name !== employee.grade) {
      errors.previousGradeId =
        "The previous grade must match this employee’s current grade.";
    }
    if (
      !historical &&
      values.expectedEmployeeGrade != null &&
      (values.expectedEmployeeGrade !== employee.grade ||
        salary(values.expectedEmployeeSalary) !== salary(employee.basicSalary))
    ) {
      errors.employeeId =
        "The employee’s grade or salary changed. Reselect the employee to review the latest values.";
    }
    if (
      values.expectedNewSalary != null &&
      salary(values.expectedNewSalary) !== salary(newGrade.salary)
    ) {
      errors.newGradeId =
        "The configured salary changed. Reselect the new grade to review it.";
    }
  }
  return errors;
}

export function recordCareerMilestone(
  milestones,
  employees,
  grades,
  values,
  today = todayInNairobi(),
) {
  const errors = validateCareerMilestone(
    values,
    milestones,
    employees,
    grades,
    today,
  );
  if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
  const {
    employee,
    currentGrade,
    previousGrade,
    newGrade,
    historical,
    scheduled,
  } = careerChangeContext(values, milestones, employees, grades, today);
  let previous = previousGrade;
  if (!previous) {
    if (historical) previous = null;
    else previous = currentGrade;
  }
  let status = "RECORDED";
  if (scheduled) status = "SCHEDULED";
  else if (historical) status = "HISTORICAL";
  else if (newGrade) status = "APPLIED";

  let previousSalary;
  if (historical) previousSalary = previous?.salary ?? null;
  else previousSalary = salary(employee.basicSalary);
  let newSalary = null;
  if (newGrade) newSalary = salary(newGrade.salary);
  const milestone = {
    id: crypto.randomUUID(),
    employeeId: employee.id,
    employeeName: employee.name,
    milestoneType: values.milestoneType,
    effectiveDate: values.effectiveDate,
    previousGradeId: previous?.id ?? null,
    previousGradeName: previous?.name || "",
    newGradeId: newGrade?.id ?? null,
    newGradeName: newGrade?.name || "",
    previousSalary,
    newSalary,
    expectedEmployeeGrade: employee.grade,
    expectedEmployeeSalary: salary(employee.basicSalary),
    description: values.description.trim(),
    status,
  };
  let nextEmployees = employees;
  if (status === "APPLIED") {
    nextEmployees = employees.map((item) => {
      if (item.id !== employee.id) return item;
      return {
        ...item,
        grade: newGrade.name,
        basicSalary: salary(newGrade.salary),
      };
    });
  }
  return {
    milestone,
    milestones: [milestone, ...milestones],
    employees: nextEmployees,
  };
}

// Pending changes use the approved salary snapshot. Changed rosters/scales require review.
export function applyDueCareerMilestones(
  milestones,
  employees,
  grades,
  today = todayInNairobi(),
) {
  let nextMilestones = milestones;
  let nextEmployees = employees;
  const due = milestones
    .filter(
      (item) => item.status === "SCHEDULED" && item.effectiveDate <= today,
    )
    .sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));
  for (const milestone of due) {
    const employee = nextEmployees.find(
      (item) => item.id === milestone.employeeId,
    );
    const grade = gradeById(grades, milestone.newGradeId);
    const { status, reviewReason } = dueMilestoneDecision(
      milestone,
      employee,
      grade,
      nextMilestones,
    );
    if (status === "APPLIED") {
      nextEmployees = nextEmployees.map((item) => {
        if (item.id !== employee.id) return item;
        return { ...item, grade: grade.name, basicSalary: milestone.newSalary };
      });
    }
    nextMilestones = nextMilestones.map((item) => {
      if (item.id !== milestone.id) return item;
      return { ...item, status, reviewReason };
    });
  }
  return { milestones: nextMilestones, employees: nextEmployees };
}

function dueMilestoneDecision(milestone, employee, grade, milestones) {
  if (!employee) {
    return {
      status: "NEEDS_REVIEW",
      reviewReason: "Employee is no longer available.",
    };
  }
  if (milestone.newGradeId == null)
    return { status: "RECORDED", reviewReason: "" };
  if (
    milestone.effectiveDate < latestCareerGradeDate(milestones, employee.id)
  ) {
    return { status: "HISTORICAL", reviewReason: "" };
  }
  if (
    !grade ||
    !validSalary(grade.salary) ||
    salary(grade.salary) !== milestone.newSalary ||
    grade.name !== milestone.newGradeName
  ) {
    return {
      status: "NEEDS_REVIEW",
      reviewReason:
        "The approved grade or salary has changed. Cancel this plan and record a reviewed milestone.",
    };
  }
  if (
    employee.grade !== milestone.expectedEmployeeGrade ||
    salary(employee.basicSalary) !== milestone.expectedEmployeeSalary
  ) {
    return {
      status: "NEEDS_REVIEW",
      reviewReason:
        "The employee’s grade or salary has changed. Cancel this plan and record a reviewed milestone.",
    };
  }
  return { status: "APPLIED", reviewReason: "" };
}

export function cancelCareerMilestone(milestones, id) {
  const milestone = milestones.find((item) => item.id === id);
  if (!milestone || !["SCHEDULED", "NEEDS_REVIEW"].includes(milestone.status))
    throw new Error(
      "Only a scheduled change or a change needing review can be cancelled.",
    );
  return milestones.map((item) => {
    if (item.id !== id) return item;
    return { ...item, status: "CANCELLED", reviewReason: "" };
  });
}

export function careerRows(milestones, employees, search = "") {
  const roster = new Map(employees.map((employee) => [employee.id, employee]));
  const query = search.trim().toLowerCase();
  const rows = [];
  for (const milestone of milestones) {
    const row = {
      ...milestone,
      employeeName:
        roster.get(milestone.employeeId)?.name || milestone.employeeName,
      typeLabel:
        MILESTONE_TYPES.find((type) => type.value === milestone.milestoneType)
          ?.label || milestone.milestoneType,
    };
    const fields = [
      row.employeeName,
      row.employeeId,
      row.typeLabel,
      row.milestoneType,
      row.previousGradeName,
      row.newGradeName,
      row.description,
      row.effectiveDate,
    ];
    if (
      fields.some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query),
      )
    )
      rows.push(row);
  }
  return rows.sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate));
}
