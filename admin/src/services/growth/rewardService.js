import { isValidDate } from "../../utils/validation/validators.js";

export const AWARD_CATEGORIES = [
  { value: "EXCELLENCE", label: "Excellence" },
  { value: "INNOVATION", label: "Innovation" },
  { value: "LONG_SERVICE", label: "Long Service" },
  { value: "PUNCTUALITY", label: "Punctuality" },
];

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
  const errors = {};
  if (!employees.some((employee) => employee.id === values.employeeId))
    errors.employeeId = "Select an employee from the current staff list.";
  if (!values.title?.trim() || values.title.trim().length > 150)
    errors.title = "Enter an award title of 1–150 characters.";
  if (!AWARD_CATEGORIES.some((category) => category.value === values.category))
    errors.category = "Select an award category.";
  if (
    !isValidDate(values.awardDate) ||
    values.awardDate < "1900-01-01" ||
    values.awardDate > "2100-12-31"
  )
    errors.awardDate = "Enter a valid award date between 1900 and 2100.";
  if ((values.description || "").length > 5000)
    errors.description = "Keep the description within 5,000 characters.";
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
