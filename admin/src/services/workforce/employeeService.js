import { JOB_GRADES, DEPARTMENTS } from "../../utils/constants/constants.js";
import { validateEmployee } from "../../utils/validation/validators.js";

// Employee CSV parsing and file downloads.
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}

// Quotes may contain commas, line breaks, and escaped quotes, so parse one
// character at a time rather than splitting the text on commas or new lines.
function parseCsvRows(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  let closedQuote = false;
  const source = text.replace(/^\uFEFF/, "");
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quoted) {
      if (character === '"' && source[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
        closedQuote = true;
      } else {
        cell += character;
      }
    } else if (character === '"') {
      if (cell || closedQuote)
        throw new Error("Invalid CSV quoting. Use the downloadable template.");
      quoted = true;
    } else if (character === "," || character === "\n" || character === "\r") {
      row.push(cell.trim());
      cell = "";
      closedQuote = false;
      if (character !== ",") {
        if (row.some(Boolean)) rows.push(row);
        row = [];
        if (character === "\r" && source[index + 1] === "\n") index += 1;
      }
    } else {
      if (closedQuote && character.trim())
        throw new Error("Unexpected text after a quoted CSV field.");
      if (!closedQuote) cell += character;
    }
  }
  if (quoted) throw new Error("A CSV field has an unclosed quote.");
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

export function parseEmployeeCsv(
  text,
  existingEmployees = [],
  departments = DEPARTMENTS,
  grades = JOB_GRADES,
) {
  const rows = parseCsvRows(text);
  if (rows.length < 2)
    throw new Error(
      "The file must contain a header and at least one employee.",
    );
  if (rows.length > 501)
    throw new Error("Import up to 500 employees at a time.");
  const headers = rows.shift().map((header) => header.toLowerCase());
  const allowed = [
    "id",
    "name",
    "email",
    "department",
    "grade",
    "hireddate",
    "status",
    "qualification",
  ];
  if (
    new Set(headers).size !== headers.length ||
    headers.some((header) => !allowed.includes(header))
  )
    throw new Error(
      "Unknown or duplicate column headings. Use the downloadable template; do not include passwords.",
    );
  const requiredHeaders = allowed.slice(0, 6);
  const missing = requiredHeaders.filter((header) => !headers.includes(header));
  if (missing.length)
    throw new Error(`Missing columns: ${missing.join(", ")}.`);
  const imported = [];
  for (let index = 0; index < rows.length; index += 1) {
    const cells = rows[index];
    if (cells.length !== headers.length)
      throw new Error(
        `Row ${index + 2}: the number of cells does not match the header.`,
      );
    const values = {};
    for (let position = 0; position < headers.length; position += 1) {
      values[headers[position]] = cells[position];
    }
    const employee = {
      id: values.id,
      name: values.name,
      email: values.email,
      department: values.department,
      grade: values.grade,
      hiredDate: values.hireddate,
      status: values.status || "Active",
      qualification: values.qualification || "",
      basicSalary:
        grades.find((grade) => grade.name === values.grade)?.salary || 0,
    };
    const errors = validateEmployee(
      employee,
      [...existingEmployees, ...imported],
      null,
      { importMode: true, departments, grades },
    );
    if (Object.keys(errors).length)
      throw new Error(`Row ${index + 2}: ${Object.values(errors)[0]}`);
    imported.push(employee);
  }
  return imported;
}

export function downloadEmployeeTemplate(
  departments = DEPARTMENTS,
  grades = JOB_GRADES,
) {
  const example = [
    "HD-IT-NEW",
    "Example Employee",
    "example.employee",
    departments[0] || "",
    grades[0]?.name || "",
    "2026-11-08",
    "Active",
    "BSc",
  ]
    .map((value) => `"${value.replaceAll('"', '""')}"`)
    .join(",");
  const csv = `id,name,email,department,grade,hiredDate,status,qualification\r\n${example}\r\n`;
  downloadBlob(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
    "HRMS-employee-import-template.csv",
  );
}

export async function exportEmployees(employees) {
  const { default: ExcelJS } = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Employees");
  sheet.columns = [
    { header: "Employee ID", key: "id", width: 18 },
    { header: "Full name", key: "name", width: 30 },
    { header: "Email / Login ID", key: "email", width: 30 },
    { header: "Department", key: "department", width: 46 },
    { header: "Job grade", key: "grade", width: 24 },
    { header: "Basic salary (ETB)", key: "basicSalary", width: 22 },
    { header: "Status", key: "status", width: 16 },
    { header: "Hired date", key: "hiredDate", width: 16 },
    { header: "Qualification", key: "qualification", width: 28 },
  ];
  // Export only the listed fields; temporary credentials and attachments are excluded.
  const rows = [];
  for (const employee of employees) {
    const row = {};
    for (const column of sheet.columns) {
      row[column.key] = employee[column.key] ?? "";
    }
    rows.push(row);
  }
  sheet.addRows(rows);
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF087F6D" },
  };
  sheet.getRow(1).height = 26;
  sheet.getColumn("basicSalary").numFmt = "#,##0.00";
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = "A1:I1";
  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    "HRMS-employees.xlsx",
  );
}
