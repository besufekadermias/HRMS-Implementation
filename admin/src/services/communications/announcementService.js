import { announcementSchema } from '../../utils/validation/communicationsSchemas.js';
import { fieldErrors } from '../../utils/validation/schemaHelpers.js';
import { todayInNairobi } from "../../utils/validation/validators.js";
import { COMMUNICATION_AUDIENCES, audienceLabel } from "./audiences.js";

export const ANNOUNCEMENT_AUDIENCES = COMMUNICATION_AUDIENCES;

export function announcementAudienceLabel(value) {
  return audienceLabel(value);
}

// Sample notices from announcement.png. These are display content, not app rules.
// Like the other demo modules, records stay in memory until the backend is connected.
export const INITIAL_ANNOUNCEMENTS = [
  {
    id: "ANN-001",
    title: "Welcome to Hadiya Science & IT Department HRMS",
    content:
      "The department is pleased to launch our comprehensive HRMS portal for staff management, recruitment tracking, attendance, and payroll services.",
    targetAudience: "ALL",
    postedBy: "Besufekad Ermias",
    date: "2026-10-22",
  },
  {
    id: "ANN-002",
    title: "Mandatory Password Reset on First Login",
    content:
      "All employees logging in with initial HR-provided credentials must update their password immediately via the Employee Portal.",
    targetAudience: "EMPLOYEES",
    postedBy: "Besufekad Ermias",
    date: "2026-10-22",
  },
  {
    id: "ANN-003",
    title: "2026 Q4 IT Positions Open for Application",
    content:
      "Qualified applicants can view open positions and application details on our public website.",
    targetAudience: "PUBLIC",
    postedBy: "Besufekad Ermias",
    date: "2026-10-22",
  },
];

export function validateAnnouncement(values) {
  return fieldErrors(announcementSchema, values);
}

export function postAnnouncement(records, values, author = "Besufekad Ermias") {
  const errors = validateAnnouncement(values);
  if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
  const announcement = {
    id: crypto.randomUUID(),
    title: values.title.trim(),
    content: values.content.trim(),
    targetAudience: values.targetAudience,
    // The backend should supply the authenticated author and posting timestamp.
    postedBy: author,
    date: todayInNairobi(),
  };
  return [announcement, ...records];
}

export function deleteAnnouncement(records, id) {
  if (!records.some((record) => record.id === id))
    throw new Error("This announcement has already been removed.");
  return records.filter((record) => record.id !== id);
}

export function announcementRows(records, search = "") {
  const query = search.trim().toLowerCase();
  return records
    .filter((record) =>
      [
        record.title,
        record.content,
        record.postedBy,
        announcementAudienceLabel(record.targetAudience),
      ].some((value) => value.toLowerCase().includes(query)),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
}
