import { jsPDF } from 'jspdf'
import { payrollRecordSchema, PAYROLL_STATUS_LABELS } from '../utils/validation/payrollSchemas.js'
import { payrollMoney, payrollMonthLabel } from '../utils/formatters/payrollFormat.js'

// Demo only. API mode downloads the server's authorized PDF for the saved run.
export function createDemoPayslipPdf(value) {
  const record = payrollRecordSchema.parse(value)
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const safe = (value) =>
    String(value)
      .replace(/\u00a0/g, ' ')
      .replace(/[–—]/g, '-')
  let y = 25
  const heading = (continuation) => {
    doc.setTextColor(8, 104, 87)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('HADIYA SCIENCE | HRMS', 20, 18)
    doc.setFontSize(22)
    doc.text(continuation ? 'Payslip - continued' : 'Employee Payslip', 20, 31)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(80, 105, 110)
    doc.text(`${payrollMonthLabel(record.month)} | ${PAYROLL_STATUS_LABELS[record.status]}`, 20, 40)
    y = 52
  }
  const textBlock = (label, value) => {
    const lines = doc.splitTextToSize(safe(`${label}: ${value || 'Not provided'}`), 170)
    doc.setFontSize(11)
    doc.setTextColor(32, 61, 67)
    doc.text(lines, 20, y)
    y += lines.length * 5 + 4
  }
  const newPageIfNeeded = (height) => {
    if (y + height > 260) {
      doc.addPage()
      heading(true)
    }
  }
  heading(false)
  textBlock('Employee', record.employee.fullName)
  textBlock('Employee ID', record.employee.serialNumber)
  textBlock('Department', record.employee.department)
  y += 4
  const rows = [
    ['Gross salary', record.gross],
    [record.incomeTaxLabel, record.incomeTax],
    [record.pensionLabel, record.pension],
    ...record.deductionItems.map((item) => [item.name, item.amount]),
    ['Other deductions total', record.otherDeductions],
    ['Net pay', record.net],
  ]
  rows.forEach(([label, amount], index) => {
    doc.setFontSize(11)
    const lines = doc.splitTextToSize(safe(label), 112)
    const height = Math.max(12, lines.length * 5 + 5)
    newPageIfNeeded(height)
    doc.setFontSize(11)
    const net = index === rows.length - 1
    if (net) {
      doc.setFillColor(230, 246, 240)
      doc.rect(20, y - 5, 170, height, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(8, 104, 87)
    } else {
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(51, 76, 81)
    }
    doc.text(lines, 23, y)
    doc.text(safe(payrollMoney(amount)), 187, y, { align: 'right' })
    doc.setDrawColor(218, 233, 229)
    doc.line(20, y + height - 5, 190, y + height - 5)
    y += height
  })
  newPageIfNeeded(27)
  y += 10
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(51, 76, 81)
  doc.text(`Employer pension: ${safe(payrollMoney(record.employerPension))}`, 20, y)
  doc.text('Employer pension is separate and does not reduce employee net pay.', 20, y + 6)
  const pages = doc.getNumberOfPages()
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page)
    doc.setTextColor(99, 118, 121)
    doc.setFontSize(8)
    doc.text(`Demo preview | Payroll record ${record.id}`, 20, 278)
    doc.text('Generated or forwarded payroll does not confirm payment.', 20, 283)
    doc.text(`Page ${page} of ${pages}`, 190, 288, { align: 'right' })
  }
  return doc.output('blob')
}
