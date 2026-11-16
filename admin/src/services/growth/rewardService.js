import { AWARD_CATEGORIES, rewardSchema } from '../../utils/validation/growthSchemas.js';
import { fieldErrors } from '../../utils/validation/schemaHelpers.js';

export { AWARD_CATEGORIES };

// Sample recognition transcribed from Rewwardandrecognations.png.
export const INITIAL_REWARDS = [
  {
    id: "RW-001",
    employeeId: "2121",
    employeeName: "Tsedeke Wondimu",
    department: "Cybersecurity & Quality Assurance",
    title: "Honer",
    category: "INNOVATION",
    awardDate: "2026-10-22",
    description: "succesfully",
  },
];

export function validateReward(values, employees) {
  return validateRewardRules(values, employees, fieldErrors(rewardSchema, values));
}

export function validateRewardRules(values, employees, errors = {}) {
  if (!employees.some(employee => employee.id === values?.employeeId))
    errors.employeeId = 'Select an employee from the current staff list.';
  return errors;
}

export function grantReward(rewards, employees, values) {
  const errors = validateReward(values, employees);
  if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
  const employee = employees.find((item) => item.id === values.employeeId);
  const reward = {
    id: crypto.randomUUID(),
    employeeId: employee.id,
    employeeName: employee.name,
    department: employee.department,
    title: values.title.trim(),
    category: values.category,
    awardDate: values.awardDate,
    description: (values.description || "").trim(),
  };
  return [reward, ...rewards];
}

export function deleteReward(rewards, id) {
  if (!rewards.some((reward) => reward.id === id))
    throw new Error("This recognition has already been removed.");
  return rewards.filter((reward) => reward.id !== id);
}

export function rewardRows(rewards, employees, search = "") {
  const roster = new Map(employees.map((employee) => [employee.id, employee]));
  const query = search.trim().toLowerCase();
  return rewards
    .map((reward) => ({
      ...reward,
      employeeName: roster.get(reward.employeeId)?.name || reward.employeeName,
      department:
        roster.get(reward.employeeId)?.department || reward.department,
      categoryLabel:
        AWARD_CATEGORIES.find((category) => category.value === reward.category)
          ?.label || reward.category,
    }))
    .filter((reward) =>
      [
        reward.employeeId,
        reward.employeeName,
        reward.department,
        reward.title,
        reward.categoryLabel,
        reward.awardDate,
        reward.description,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query),
      ),
    )
    .sort((a, b) => b.awardDate.localeCompare(a.awardDate));
}
