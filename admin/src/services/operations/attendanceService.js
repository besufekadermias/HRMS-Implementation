import { attendanceSettingsSchema } from '../../utils/validation/operationsSchemas.js';
import { fieldErrors } from '../../utils/validation/schemaHelpers.js';
import formatTime, { formatTimestamp } from '../../utils/formatters/formatTime.js';
import {
  ATTENDANCE_STATUSES,
} from "../../utils/constants/constants.js";

// Read-only display helpers. No IP checks, attendance writes, or rule enforcement.
export function buildDailyAttendance(
  employees,
  departments,
  records,
  date,
  fallbackHeads = [],
) {
  const rows = [];
  for (const employee of employees) {
    if (employee.hiredDate && !(employee.hiredDate <= date)) continue;
    const department = departments.find(
      (item) => item.name === employee.department,
    );
    const assignedHead = department?.headId === employee.id;
    const roleHead = employee.portalRole === "Head of Department";
    const fallbackHead =
      !department?.headId &&
      !employee.portalRole &&
      fallbackHeads.some(
        (head) =>
          head.employeeId === employee.id &&
          head.department === employee.department,
      );
    const record = records.find(
      (item) => item.employeeId === employee.id && item.date === date,
    );
    let lateMinutes = null;
    if (Number.isFinite(record?.lateMinutes) && record.lateMinutes >= 0) {
      lateMinutes = record.lateMinutes;
    }
    let attendanceStatus = "No data";
    if (ATTENDANCE_STATUSES.includes(record?.status))
      attendanceStatus = record.status;
    let checkInIp = null;
    let checkOutIp = null;
    let checkInVerification = null;
    let checkOutVerification = null;
    if (record?.checkIn) {
      checkInIp = record.checkInIp || null;
      checkInVerification = record.checkInVerification || "Unavailable";
    }
    if (record?.checkOut) {
      checkOutIp = record.checkOutIp || null;
      checkOutVerification = record.checkOutVerification || "Unavailable";
    }
    rows.push({
      ...employee,
      attendanceDate: date,
      hasAttendanceRecord: !!record,
      expectedStart: record?.expectedStart || null,
      lateMinutes,
      isHead: assignedHead || roleHead || fallbackHead,
      attendanceStatus,
      checkIn: record?.checkIn || null,
      checkOut: record?.checkOut || null,
      checkInIp,
      checkOutIp,
      checkInVerification,
      checkOutVerification,
    });
  }
  return rows;
}

export function summarizeAttendance(rows) {
  const summary = Object.fromEntries(
    ATTENDANCE_STATUSES.map((status) => [status, 0]),
  );
  let checkedIn = 0;
  let heads = 0;
  let headsCheckedIn = 0;
  // Each employee contributes one daily attendance status.
  for (const row of rows) {
    summary[row.attendanceStatus] += 1;
    if (row.checkIn) checkedIn += 1;
    if (row.isHead) heads += 1;
    if (row.isHead && row.checkIn) headsCheckedIn += 1;
  }
  return {
    ...summary,
    total: rows.length,
    checkedIn,
    heads,
    headsCheckedIn,
  };
}

export function filterAttendance(
  rows,
  { search = "", department = "", status = "", role = "" } = {},
) {
  const query = search.trim().toLowerCase();
  return rows.filter((row) => {
    if (department && row.department !== department) return false;
    if (status && row.attendanceStatus !== status) return false;
    if (role) {
      if (role === "hod" && !row.isHead) return false;
      if (role !== "hod" && row.isHead) return false;
    }
    return [row.name, row.id, row.department].some((value) =>
      value.toLowerCase().includes(query),
    );
  });
}

export function summarizeDepartments(rows, departments) {
  const names = new Set();
  for (const department of departments) names.add(department.name);
  for (const row of rows) names.add(row.department);
  return [...names].map((name) => ({
    name,
    ...summarizeAttendance(rows.filter((row) => row.department === name)),
  }));
}

export function formatAttendanceTime(value) {
  return formatTime(value);
}

export function buildAttendanceHistory(
  employees,
  departments,
  records,
  fallbackHeads = [],
) {
  const dates = [...new Set(records.map((record) => record.date))];
  const history = [];
  for (const date of dates) {
    const rows = buildDailyAttendance(
      employees,
      departments,
      records,
      date,
      fallbackHeads,
    );
    for (const row of rows) {
      if (row.hasAttendanceRecord) history.push(row);
    }
  }
  return history;
}

export function buildCheckInLogs(history) {
  const logs = [];
  for (const row of history) {
    if (row.checkIn)
      logs.push({ ...row, logId: `${row.id}:${row.attendanceDate}` });
  }
  return logs.sort(
    (a, b) => (Date.parse(b.checkIn) || 0) - (Date.parse(a.checkIn) || 0),
  );
}

export function filterAttendanceHistory(rows, filters) {
  const { startDate, endDate, completion, verification } = filters;
  return filterAttendance(rows, filters).filter((row) => {
    if (startDate && !(row.attendanceDate >= startDate)) return false;
    if (endDate && !(row.attendanceDate <= endDate)) return false;
    if (completion) {
      if (completion === "checked-out" && !row.checkOut) return false;
      if (completion !== "checked-out" && row.checkOut) return false;
    }
    if (
      verification &&
      ![row.checkInVerification, row.checkOutVerification].includes(
        verification,
      )
    )
      return false;
    return true;
  });
}

export function sortLateArrivals(rows, sort = "newest") {
  return [...rows].sort((a, b) => {
    if (sort === "delay") {
      // Unknown delays stay last; do not turn them into zero minutes.
      if (a.lateMinutes === null && b.lateMinutes !== null) return 1;
      if (b.lateMinutes === null && a.lateMinutes !== null) return -1;
      if (a.lateMinutes !== b.lateMinutes) return b.lateMinutes - a.lateMinutes;
    }
    return (
      b.attendanceDate.localeCompare(a.attendanceDate) ||
      a.name.localeCompare(b.name)
    );
  });
}

export function summarizeLateArrivals(rows) {
  let knownDelays = 0;
  let totalDelay = 0;
  let longestDelay = -Infinity;
  const employeeIds = new Set();
  for (const row of rows) {
    employeeIds.add(row.id);
    if (row.lateMinutes === null) continue;
    knownDelays += 1;
    totalDelay += row.lateMinutes;
    longestDelay = Math.max(longestDelay, row.lateMinutes);
  }
  let averageDelay = null;
  if (knownDelays > 0) averageDelay = totalDelay / knownDelays;
  else longestDelay = null;
  return {
    occurrences: rows.length,
    employees: employeeIds.size,
    averageDelay,
    longestDelay,
    unknownDelays: rows.length - knownDelays,
  };
}

export function formatAttendanceTimestamp(value) {
  return formatTimestamp(value);
}

export function formatLateMinutes(value) {
  return value === null ? "—" : `${Number(value.toFixed(1))} min`;
}

function splitIpAddresses(value) {
  return value
    .split(/[,\n]+/)
    .map((address) => address.trim())
    .filter(Boolean);
}

// Parsing only: this never looks up the network or verifies someone's IP.
function normalizeIpAddress(address) {
  if (address.includes(":")) {
    if (!/^[\da-fA-F:.]+$/.test(address)) return null;
    try {
      return new URL(`http://[${address}]/`).hostname.slice(1, -1);
    } catch {
      return null;
    }
  }
  const parts = address.split(".");
  const validParts =
    parts.length === 4 &&
    parts.every(
      (part) => /^(0|[1-9]\d{0,2})$/.test(part) && Number(part) <= 255,
    );
  if (!validParts) return null;
  return address;
}

export function validateAttendanceSettings(values) {
  return validateAttendanceSettingsRules(values, fieldErrors(attendanceSettingsSchema, values));
}

// These schedule and IP checks are shared by the form and saved-data validation.
export function validateAttendanceSettingsRules(values, errors = {}) {
  if (!values || typeof values !== 'object') return errors;
  if (!errors.startTime && !errors.endTime && values.endTime <= values.startTime)
    errors.endTime = 'End time must be after start time for this daily schedule.';
  if (!errors.gracePeriod && !errors.startTime && !errors.endTime) {
    const [startHour, startMinute] = values.startTime.split(':').map(Number);
    const [endHour, endMinute] = values.endTime.split(':').map(Number);
    if (Number(values.gracePeriod) >= (endHour - startHour) * 60 + endMinute - startMinute)
      errors.gracePeriod = 'Grace period must be shorter than the working day.';
  }
  if (!errors.allowedIps) {
    const addresses = splitIpAddresses(values.allowedIps).map(normalizeIpAddress);
    if (addresses.includes(null))
      errors.allowedIps = 'Enter valid IPv4 or IPv6 addresses, separated by commas or new lines. URLs and subnet ranges are not supported.';
    else if (new Set(addresses).size !== addresses.length)
      errors.allowedIps = 'Remove duplicate IP addresses.';
  }
  return errors;
}

export function normalizeAttendanceSettings(values) {
  return {
    startTime: values.startTime,
    endTime: values.endTime,
    gracePeriod: String(Number(values.gracePeriod)),
    allowedIps: splitIpAddresses(values.allowedIps)
      .map(normalizeIpAddress)
      .join("\n"),
  };
}
