import { SERVICE_TYPES, getServiceSchema } from '../../utils/validation/communicationsSchemas.js';
import { fieldErrors } from '../../utils/validation/schemaHelpers.js';
import { todayInNairobi } from "../../utils/validation/validators.js";

export { SERVICE_TYPES };

// Add confirmed offerings through the form. The reference only shows the public homepage.
export const INITIAL_SERVICES = [];
export const EMPTY_SERVICE = {
  title: "",
  type: "SERVICE",
  description: "",
  requirements: "",
  howToAccess: "",
  location: "",
  schedule: "",
  fees: "",
  registrationUrl: "",
  status: "DRAFT",
};

export function serviceTypeLabel(type) {
  return SERVICE_TYPES.find((item) => item.value === type)?.label || type;
}

export function serviceLink(value) {
  const text = typeof value === "string" ? value.trim() : "";
  if (text.length > 2048 || !/^https?:\/\//i.test(text) || /\s/.test(text))
    return "";
  try {
    const url = new URL(text);
    return !url.username && !url.password ? url.href : "";
  } catch {
    return "";
  }
}

export function validateService(values) {
  return validateServiceRules(values, fieldErrors(getServiceSchema(values?.type), values));
}

export function validateServiceRules(values, errors = {}) {
  if (!values || typeof values !== 'object') return errors;
  if (values.status === 'PUBLISHED') {
    if (typeof values.description !== 'string' || !values.description.trim())
      errors.description = 'Add a description before publishing.';
    if (typeof values.howToAccess !== 'string' || !values.howToAccess.trim())
      errors.howToAccess = 'Explain how the public can access this service before publishing.';
  }
  const registrationUrl = typeof values.registrationUrl === 'string' ? values.registrationUrl.trim() : values.registrationUrl;
  if (registrationUrl && !serviceLink(registrationUrl))
    errors.registrationUrl = 'Enter a complete HTTP/HTTPS link without spaces or embedded credentials (up to 2,048 characters).';
  return errors;
}

export function saveService(records, values) {
  const errors = validateService(values);
  if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
  const existing = values.id
    ? records.find((record) => record.id === values.id)
    : null;
  if (values.id && !existing)
    throw new Error(
      "This service no longer exists. Close the form and try again.",
    );
  const fields = Object.fromEntries(
    Object.keys(EMPTY_SERVICE).map((key) => [key, (values[key] || "").trim()]),
  );
  const record = {
    ...fields,
    id: existing?.id || crypto.randomUUID(),
    schedule: values.type === "TRAINING" ? fields.schedule : "",
    registrationUrl: fields.registrationUrl
      ? serviceLink(fields.registrationUrl)
      : "",
    createdAt: existing?.createdAt || todayInNairobi(),
    updatedAt: todayInNairobi(),
  };
  return existing
    ? records.map((item) => (item.id === existing.id ? record : item))
    : [record, ...records];
}

export function deleteService(records, id) {
  if (!records.some((record) => record.id === id))
    throw new Error("This service has already been removed.");
  return records.filter((record) => record.id !== id);
}

export function serviceRows(records, search = "", type = "", status = "") {
  const query = search.trim().toLowerCase();
  return records
    .filter(
      (record) =>
        (!type || record.type === type) &&
        (!status || record.status === status) &&
        [
          record.title,
          record.description,
          record.requirements,
          record.location,
          serviceTypeLabel(record.type),
        ].some((value) => (value || "").toLowerCase().includes(query)),
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

// An explicit field list keeps future admin-only fields out of the public catalog.
export function publicServiceRecord(record) {
  return {
    id: record.id,
    title: record.title,
    type: record.type,
    description: record.description,
    requirements: record.requirements,
    howToAccess: record.howToAccess,
    location: record.location,
    schedule: record.type === "TRAINING" ? record.schedule : "",
    fees: record.fees,
    registrationUrl: serviceLink(record.registrationUrl),
    updatedAt: record.updatedAt,
  };
}

export function publicServiceCatalog(records) {
  return serviceRows(records, "", "", "PUBLISHED").map(publicServiceRecord);
}
