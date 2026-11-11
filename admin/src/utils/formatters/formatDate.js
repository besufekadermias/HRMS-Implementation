export default function formatDate(value, options = {}) {
  if (!value) return "—";
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Nairobi",
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  }).format(date);
}
