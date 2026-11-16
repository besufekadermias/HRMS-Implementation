import { documentSchema } from '../../utils/validation/communicationsSchemas.js';
import { fieldErrors } from '../../utils/validation/schemaHelpers.js';
import { todayInNairobi } from "../../utils/validation/validators.js";
import { COMMUNICATION_AUDIENCES, audienceLabel } from "./audiences.js";

export const DOCUMENT_AUDIENCES = COMMUNICATION_AUDIENCES;
export const DOCUMENT_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "txt",
  "csv",
  "jpg",
  "jpeg",
  "png",
];
export const DOCUMENT_ACCEPT = DOCUMENT_EXTENSIONS.map(
  (extension) => `.${extension}`,
).join(",");
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

// Reference row from documents.png. No actual attachment was supplied.
// Its employee-policy title uses the Employees audience in this demo.
export const INITIAL_DOCUMENTS = [
  {
    id: "1",
    title: "Rule and Regulation for employee",
    date: "2026-10-24",
    targetAudience: "EMPLOYEES",
    source: "URL",
    url: "",
    file: null,
  },
];

export function documentUrl(value) {
  const text = typeof value === "string" ? value.trim() : "";
  if (text.length > 2048 || !/^https?:\/\//i.test(text) || /\s/.test(text))
    return "";
  try {
    const url = new URL(text);
    return ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : "";
  } catch {
    return "";
  }
}

export function validateDocument(values) {
  return validateDocumentRules(values, fieldErrors(documentSchema, values));
}

export function validateDocumentRules(values, errors = {}) {
  if (!values || typeof values !== 'object') return errors;
  if (values.source === 'URL' && !documentUrl(values.url))
    errors.url = 'Enter a complete http:// or https:// link without spaces or embedded credentials (up to 2,048 characters).';
  if (values.source === 'FILE') {
    const file = values.file;
    if (typeof File === 'undefined' || !(file instanceof File)) errors.file = 'Choose a document to upload.';
    else if (!file.size) errors.file = 'This file is empty. Choose a file with content.';
    else if (file.size > MAX_DOCUMENT_BYTES) errors.file = 'Choose a file no larger than 10 MB.';
    else if (!DOCUMENT_EXTENSIONS.includes(file.name.split('.').pop().toLowerCase()))
      errors.file = 'Choose a PDF, Word, Excel, PowerPoint, text, CSV, JPG, or PNG file.';
  }
  return errors;
}

export function publishDocument(records, values) {
  const errors = validateDocument(values);
  if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
  // IDs and timestamps will come from the server when persistence is connected.
  const id = String(
    Math.max(0, ...records.map((record) => Number(record.id) || 0)) + 1,
  );
  const record = {
    id,
    title: values.title.trim(),
    date: todayInNairobi(),
    targetAudience: values.targetAudience,
    source: values.source,
    // Keep only the selected source. A File is held in memory, never in localStorage.
    file: values.source === "FILE" ? values.file : null,
    url: values.source === "URL" ? documentUrl(values.url) : "",
  };
  return [record, ...records];
}

export function deleteDocument(records, id) {
  if (!records.some((record) => record.id === id))
    throw new Error("This document has already been removed.");
  return records.filter((record) => record.id !== id);
}

export function documentRows(records, search = "", audience = "") {
  const query = search.trim().toLowerCase();
  return records
    .filter(
      (record) =>
        (!audience || record.targetAudience === audience) &&
        [
          `#${record.id}`,
          record.title,
          audienceLabel(record.targetAudience),
          record.file?.name,
          record.url,
        ].some((value) => (value || "").toLowerCase().includes(query)),
    )
    .sort(
      (a, b) => b.date.localeCompare(a.date) || Number(b.id) - Number(a.id),
    );
}

export function documentFileSize(bytes) {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.ceil(bytes / 1024))} KB`;
}
