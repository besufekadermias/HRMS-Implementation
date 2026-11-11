// Shared destinations for notices and institutional documents.
export const COMMUNICATION_AUDIENCES = [
  {
    value: "ALL",
    label: "Both (Public website & Employee dashboard)",
    badge: "BOTH",
  },
  {
    value: "EMPLOYEES",
    label: "Employees (Employee dashboard only)",
    badge: "EMPLOYEES",
  },
  {
    value: "PUBLIC",
    label: "Public (Public website — visible to everyone)",
    badge: "PUBLIC",
  },
];

export function audienceLabel(value) {
  return (
    COMMUNICATION_AUDIENCES.find((audience) => audience.value === value)
      ?.badge || value
  );
}
