import { monthLabel, summarizePayroll } from "./payrollCalculations.js";

export async function createPayrollWorkbook(run) {
  const { default: ExcelJS } = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Hadiya Science HRMS";
  const sheet = workbook.addWorksheet("Payroll", {
    views: [{ state: "frozen", ySplit: 4 }],
  });
  sheet.addRow(["Hadiya Science · Payroll for Finance"]);
  sheet.addRow([
    monthLabel(run.month),
    "Currency: ETB",
    `Status: ${run.status}`,
  ]);
  sheet.addRow([
    "Employee pension reduces net pay. Employer pension is shown separately.",
  ]);
  sheet.addRow([
    "Employee ID",
    "Employee",
    "Department",
    "Gross Salary",
    "Income Tax",
    "Employee Pension",
    "Other Deductions",
    "Net Salary",
    "Employer Pension",
    "Status",
  ]);
  for (const row of run.rows)
    sheet.addRow([
      row.employeeId,
      row.employeeName,
      row.department,
      row.gross,
      row.incomeTax,
      row.pension,
      row.otherDeductions,
      row.net,
      row.employerPension,
      run.status,
    ]);
  const totals = summarizePayroll(run);
  sheet.addRow([
    "TOTAL",
    "",
    "",
    totals.gross,
    totals.incomeTax,
    totals.pension,
    totals.otherDeductions,
    totals.net,
    totals.employerPension,
    "",
  ]);
  sheet.columns.forEach((column, index) => {
    column.width = [20, 30, 42, 19, 19, 22, 22, 20, 22, 28][index];
  });
  for (const rowNumber of [1, 4, sheet.rowCount]) {
    sheet.getRow(rowNumber).font = {
      bold: true,
      color: { argb: rowNumber === 4 ? "FFFFFFFF" : "FF075E52" },
    };
    sheet.getRow(rowNumber).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: rowNumber === 4 ? "FF087F6D" : "FFE3F6F1" },
    };
    sheet.getRow(rowNumber).height = 28;
  }
  for (let row = 5; row <= sheet.rowCount; row++) {
    for (let column = 4; column <= 9; column++)
      sheet.getCell(row, column).numFmt = "#,##0.00";
  }
  sheet.autoFilter = { from: "A4", to: `J${run.rows.length + 4}` };
  sheet.pageSetup = {
    paperSize: 9,
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    printTitlesRow: "1:4",
  };
  return workbook;
}

export async function exportPayrollExcel(run) {
  const workbook = await createPayrollWorkbook(run);
  const bytes = await workbook.xlsx.writeBuffer();
  const url = URL.createObjectURL(
    new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `payroll-${run.month}-finance.xlsx`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const escape = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ],
  );
const money = (amount) =>
  amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function payrollPrintHtml(run, employeeRow = null) {
  const rows = employeeRow ? [employeeRow] : run.rows;
  const totals = summarizePayroll({ rows });
  const title = employeeRow ? "Employee Payslip" : "Payroll Summary";
  let tableRowsHtml = "";
  for (const row of rows) {
    tableRowsHtml += `<tr><td>${escape(row.employeeName)}<br><small>${escape(row.employeeId)}</small></td><td>${escape(row.department)}</td><td>${money(row.gross)}</td><td>${money(row.incomeTax)}</td><td>${money(row.pension)}</td><td>${money(row.otherDeductions)}</td><td>${money(row.net)}</td></tr>`;
  }
  let otherDeductionsHtml = "";
  if (employeeRow?.deductionItems.length) {
    let deductionItemsHtml = "";
    for (const deduction of employeeRow.deductionItems) {
      deductionItemsHtml += `<li>${escape(deduction.name)}: ETB ${money(deduction.amount)}</li>`;
    }
    otherDeductionsHtml = `<h2>Other deductions</h2><ul>${deductionItemsHtml}</ul>`;
  }
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title} · ${escape(run.month)}</title><style>
    @page { size: ${employeeRow ? "A4 portrait" : "A4 landscape"}; margin: 15mm } body { font: 12px Arial,sans-serif; color:#173c45 } h1 { color:#087f6d } table { width:100%;border-collapse:collapse;margin:24px 0 } th,td { padding:10px 7px;border-bottom:1px solid #d9e7e8;text-align:left } th { background:#e5f5f1 } .net { font-size:20px;color:#087f6d } small { color:#59757c } thead { display:table-header-group } tr { break-inside:avoid }
    </style></head><body><small>HADIYA SCIENCE · HRMS</small><h1>${title}</h1><p>${escape(monthLabel(run.month))} · ${escape(run.status.replaceAll("_", " "))} · All amounts in ETB</p>
    <table><thead><tr><th>Employee / ID</th><th>Department</th><th>Gross</th><th>Tax</th><th>Pension</th><th>Other</th><th>Net Pay</th></tr></thead><tbody>${tableRowsHtml}</tbody></table>
    ${otherDeductionsHtml}
    <p>Gross: ETB ${money(totals.gross)} · Employee deductions: ETB ${money(totals.totalDeductions)}</p><p class="net">Net Pay: ETB ${money(totals.net)}</p>
    <p>Employer pension: ETB ${money(totals.employerPension)} (not deducted from employee net pay).</p><small>Payroll record ${escape(run.id)}. Generated records do not confirm payment. Finance handles disbursement.</small></body></html>`;
}

export function printPayroll(run, employeeRow = null) {
  const frame = document.createElement("iframe");
  frame.title = "Printable payroll";
  frame.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  frame.onload = () => {
    frame.contentWindow.addEventListener("afterprint", () => frame.remove(), {
      once: true,
    });
    frame.contentWindow.focus();
    frame.contentWindow.print();
  };
  frame.srcdoc = payrollPrintHtml(run, employeeRow);
  document.body.append(frame);
}
