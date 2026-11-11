// Report categories match system_reports.report_type in the database schema.
export const REPORT_CATEGORIES = [
  { value: "EMPLOYEE_SUBMISSION", label: "Employee Submission" },
  { value: "PAYROLL_SUMMARY", label: "Payroll Summary" },
  { value: "ATTENDANCE_SUMMARY", label: "Attendance Summary" },
  { value: "LEAVE_REPORT", label: "Leave Report" },
  { value: "RECRUITMENT_SUMMARY", label: "Recruitment Summary" },
  { value: "DISCIPLINARY_REPORT", label: "Disciplinary Report" },
];

// One sample report from reportview.png. No attachment was supplied.
export const INITIAL_REPORTS = [
  {
    id: "1",
    category: "EMPLOYEE_SUBMISSION",
    submittedBy: "Sisay Kebede",
    submittedRole: "EMPLOYEE",
    title: "finally",
    content: "I just finished all the process",
    attachmentUrl: "",
    date: "2026-10-22",
  },
];

export function reportCategoryLabel(category) {
  return (
    REPORT_CATEGORIES.find((item) => item.value === category)?.label ||
    category.replaceAll("_", " ")
  );
}

export function reportRows(reports, search = "", category = "") {
  const query = search.trim().toLowerCase();
  return reports
    .filter(
      (report) =>
        (!category || report.category === category) &&
        [
          `#${report.id}`,
          reportCategoryLabel(report.category),
          report.submittedBy,
          report.submittedRole,
          report.title,
          report.content,
        ].some((value) => (value || "").toLowerCase().includes(query)),
    )
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) ||
        String(b.id).localeCompare(String(a.id), undefined, { numeric: true }),
    );
}

export function reportAttachmentUrl(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : "";
  } catch {
    return "";
  }
}
