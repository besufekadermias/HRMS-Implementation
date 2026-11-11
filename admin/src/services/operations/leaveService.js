import {
  INITIAL_LEAVE_SETTINGS,
  MAX_LEAVE_BALANCE,
} from "../../utils/constants/constants.js";
import {
  isValidDate,
  todayInNairobi,
} from "../../utils/validation/validators.js";
import { getLeaveYear, isLeaveYearStart } from "./leaveYear.js";

// Display helpers and local-only rules. The backend must repeat business validation.
// Network calls belong in leaveApi.js; these functions never fetch or write storage.

export function getLeaveBalance(balance) {
  if (
    !balance ||
    !Number.isInteger(balance.accrued) ||
    !Number.isInteger(balance.used) ||
    balance.accrued < 0 ||
    balance.used < 0 ||
    balance.used > balance.accrued
  )
    return null;
  return { ...balance, remaining: balance.accrued - balance.used };
}

export function buildLeaveRows(requests, balances, employees) {
  return requests.map((request) => {
    const employee = employees.find((item) => item.id === request.employeeId);
    return {
      ...request,
      name: employee?.name || request.employeeName || "Employee unavailable",
      department: employee?.department || request.department || "—",
      balance: getLeaveBalance(
        balances.find((item) => item.employeeId === request.employeeId),
      ),
    };
  });
}

export function summarizeLeave(requests, today) {
  let pending = 0;
  let approved = 0;
  const employeesOnLeave = new Set();
  for (const request of requests) {
    if (request.status === "PENDING") pending += 1;
    if (request.status !== "APPROVED") continue;
    approved += 1;
    if (
      isValidDate(request.startDate) &&
      isValidDate(request.endDate) &&
      request.startDate <= today &&
      request.endDate >= today
    ) {
      employeesOnLeave.add(request.employeeId);
    }
  }
  return { pending, approved, onLeave: employeesOnLeave.size };
}

export function filterLeaveRequests(rows, { search = "", status = "" } = {}) {
  const query = search.trim().toLowerCase();
  return rows.filter((row) => {
    if (status && row.status !== status) return false;
    return [row.name, row.employeeId, row.department].some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(query),
    );
  });
}

export function getLeaveApprovalError(
  request,
  balance,
  requests,
  employees,
  settings = INITIAL_LEAVE_SETTINGS,
) {
  if (!request || request.status !== "PENDING")
    return "Only pending requests can be approved.";
  if (!employees.some((employee) => employee.id === request.employeeId)) {
    return "The employee record is unavailable. Review the employee before approving.";
  }
  if (
    !isValidDate(request.startDate) ||
    !isValidDate(request.endDate) ||
    request.endDate < request.startDate
  ) {
    return "The leave dates are invalid. Correct the request before approving.";
  }
  const calendarDays =
    (Date.parse(request.endDate) - Date.parse(request.startDate)) / 86400000 +
    1;
  if (
    !Number.isInteger(request.daysRequested) ||
    request.daysRequested < 1 ||
    request.daysRequested > calendarDays
  ) {
    return "Requested days must be a positive whole number within the leave window.";
  }
  const current = getLeaveBalance(balance);
  if (!current) return "A valid leave balance is required before approval.";
  const yearError = getRequestYearError(request, balance);
  if (yearError) return yearError;
  if (current.remaining > Number(settings.maxBalance)) {
    return `The balance exceeds the ${settings.maxBalance}-day annual limit. Correct it before approving.`;
  }
  if (request.daysRequested > current.remaining)
    return "The request exceeds the employee’s remaining leave balance.";
  if (
    requests.some(
      (other) =>
        other.id !== request.id &&
        other.employeeId === request.employeeId &&
        other.status === "APPROVED" &&
        other.startDate <= request.endDate &&
        other.endDate >= request.startDate,
    )
  ) {
    return "This request overlaps an approved leave for the same employee.";
  }
  return "";
}

export function getRequestYearError(request, balance) {
  if (!isValidDate(request.startDate) || !isValidDate(request.endDate))
    return "The leave dates are invalid.";
  const period = getLeaveYear(request.startDate);
  if (request.endDate > period.end)
    return "Leave crosses Ethiopian New Year. Submit a separate request for each leave year.";
  if (!isLeaveYearStart(balance?.yearStart))
    return "A valid leave balance year is required.";
  if (period.start < balance.yearStart)
    return "This leave year has expired. Previous-year requests cannot change the current balance.";
  if (period.start > balance.yearStart)
    return "This request belongs to a future Ethiopian year. Approve it after Meskerem 1.";
  return "";
}

// One state transition keeps the request and balance together. Server integration
// must enforce these checks and persist both changes in a transaction.
export function decideLeave(
  state,
  employees,
  decision,
  settings = INITIAL_LEAVE_SETTINGS,
) {
  const {
    requestId,
    status,
    note = "",
    decidedAt = new Date().toISOString(),
  } = decision;
  const request = state.requests.find((item) => item.id === requestId);
  if (!request) throw new Error("The leave request is no longer available.");
  if (status === "PENDING")
    return reopenLeave(state, request, settings, note, decidedAt);
  if (request.status !== "PENDING")
    throw new Error("This request has already been decided.");
  if (!["APPROVED", "REJECTED"].includes(status))
    throw new Error("Choose approve or reject.");
  const reason = validateDecisionNote(
    note,
    status === "REJECTED" && settings.requireRejectionReason,
  );
  if (status === "APPROVED") {
    const balance = state.balances.find(
      (item) => item.employeeId === request.employeeId,
    );
    const error = getLeaveApprovalError(
      request,
      balance,
      state.requests,
      employees,
      settings,
    );
    if (error) throw new Error(error);
  }
  const requests = state.requests.map((item) => {
    if (item.id !== requestId) return item;
    return {
      ...item,
      status,
      decidedAt,
      decisionNote: reason,
      history: [
        ...(item.history || []),
        { action: status, at: decidedAt, note: reason },
      ],
    };
  });
  let balances = state.balances;
  if (status === "APPROVED") {
    balances = balances.map((balance) => {
      if (balance.employeeId !== request.employeeId) return balance;
      return { ...balance, used: balance.used + request.daysRequested };
    });
  }
  return { ...state, requests, balances };
}

function validateDecisionNote(note, required) {
  const value = String(note || "").trim();
  if (required && !value) throw new Error("Enter a reason for this action.");
  if (value.length > 1000)
    throw new Error("Keep the reason to 1,000 characters or fewer.");
  return value;
}

function reopenLeave(state, request, settings, note, at) {
  if (!["APPROVED", "REJECTED"].includes(request.status))
    throw new Error("Only decided requests can be reopened.");
  const reason = validateDecisionNote(note, true);
  let balances = state.balances;
  if (request.status === "APPROVED") {
    const balance = getLeaveBalance(
      balances.find((item) => item.employeeId === request.employeeId),
    );
    const yearError = getRequestYearError(request, balance);
    if (yearError) throw new Error(yearError);
    if (
      !balance ||
      !Number.isInteger(request.daysRequested) ||
      request.daysRequested < 1 ||
      balance.used < request.daysRequested
    ) {
      throw new Error(
        "The used balance cannot be reconciled with this approval. Review the balance before reopening.",
      );
    }
    if (
      balance.remaining + request.daysRequested >
      Number(settings.maxBalance)
    ) {
      throw new Error(
        "Restoring these days would exceed the balance cap. Review the entitlement before reopening.",
      );
    }
    balances = balances.map((item) => {
      if (item.employeeId !== request.employeeId) return item;
      return { ...item, used: item.used - request.daysRequested };
    });
  }
  const requests = state.requests.map((item) => {
    if (item.id !== request.id) return item;
    return {
      ...item,
      status: "PENDING",
      decidedAt: null,
      decisionNote: "",
      history: [
        ...(item.history || []),
        { action: "REOPENED", previousStatus: item.status, at, note: reason },
      ],
    };
  });
  return { ...state, balances, requests };
}

export function countLeaveDays(startDate, endDate, mode = "calendar") {
  if (!isValidDate(startDate) || !isValidDate(endDate) || endDate < startDate)
    return 0;
  const start = new Date(`${startDate}T00:00:00Z`);
  const days = (Date.parse(endDate) - start.getTime()) / 86400000 + 1;
  if (mode === "calendar") return days;
  const weeks = Math.floor(days / 7);
  let total = weeks * 5;
  for (let offset = 0; offset < days % 7; offset += 1) {
    const day = (start.getUTCDay() + offset) % 7;
    if (day !== 0 && day !== 6) total += 1;
  }
  return total;
}

export function validateLeaveSettings(values, balances = []) {
  const errors = {};
  for (const [key, label, min, max] of [
    ["defaultEntitlement", "Annual entitlement", 1, MAX_LEAVE_BALANCE],
    ["maxBalance", "Balance cap", 1, MAX_LEAVE_BALANCE],
    ["noticeDays", "Notice period", 0, 365],
  ]) {
    if (
      !/^\d+$/.test(String(values[key])) ||
      Number(values[key]) < min ||
      Number(values[key]) > max
    ) {
      errors[key] = `${label} must be a whole number from ${min} to ${max}.`;
    }
  }
  if (
    !errors.defaultEntitlement &&
    !errors.maxBalance &&
    Number(values.defaultEntitlement) > Number(values.maxBalance)
  ) {
    errors.defaultEntitlement =
      "Annual entitlement cannot exceed the balance cap.";
  }
  if (!["calendar", "weekdays"].includes(values.dayCounting))
    errors.dayCounting = "Choose calendar days or Monday–Friday.";
  if (typeof values.requireRejectionReason !== "boolean")
    errors.requireRejectionReason =
      "Choose whether a rejection reason is required.";
  if (
    !errors.maxBalance &&
    balances.some((balance) => {
      const current = getLeaveBalance(balance);
      return current && current.remaining > Number(values.maxBalance);
    })
  )
    errors.maxBalance =
      "An existing balance exceeds this cap. Adjust that entitlement before lowering the cap.";
  return errors;
}

export function normalizeLeaveSettings(values) {
  return {
    defaultEntitlement: String(Number(values.defaultEntitlement)),
    maxBalance: String(Number(values.maxBalance)),
    dayCounting: values.dayCounting,
    noticeDays: String(Number(values.noticeDays)),
    requireRejectionReason: values.requireRejectionReason,
  };
}

export function saveLeaveRequest(
  state,
  employees,
  values,
  settings = INITIAL_LEAVE_SETTINGS,
  today = todayInNairobi(),
) {
  let original = null;
  if (values.id)
    original = state.requests.find((item) => item.id === values.id);
  if (values.id && !original) throw new Error("The request no longer exists.");
  if (original && original.status !== "PENDING")
    throw new Error("Reopen this request before editing it.");
  const employee = employees.find((item) => item.id === values.employeeId);
  if (!employee) throw new Error("Choose an employee from the roster.");
  if (original && original.employeeId !== employee.id)
    throw new Error("The employee cannot be changed on an existing request.");
  const daysRequested = countLeaveDays(
    values.startDate,
    values.endDate,
    settings.dayCounting,
  );
  if (!daysRequested)
    throw new Error(
      "Choose a valid leave window containing at least one chargeable day.",
    );
  if (values.endDate > getLeaveYear(values.startDate).end) {
    throw new Error(
      "Leave crosses Ethiopian New Year. Submit a separate request for each leave year.",
    );
  }
  if (daysRequested > Number(settings.maxBalance))
    throw new Error(
      `A request cannot exceed ${settings.maxBalance} chargeable days.`,
    );
  if (
    !original ||
    original.startDate !== values.startDate ||
    original.endDate !== values.endDate
  ) {
    const notice =
      (Date.parse(values.startDate) - Date.parse(today)) / 86400000;
    if (notice < Number(settings.noticeDays))
      throw new Error(
        `The start date must be at least ${settings.noticeDays} days from today.`,
      );
  }
  const reason = String(values.reason || "").trim();
  if (!reason || reason.length > 1000)
    throw new Error("Enter a leave reason of 1–1,000 characters.");
  if (
    state.requests.some(
      (item) =>
        item.id !== original?.id &&
        item.employeeId === employee.id &&
        ["PENDING", "APPROVED"].includes(item.status) &&
        item.startDate <= values.endDate &&
        item.endDate >= values.startDate,
    )
  ) {
    throw new Error(
      "This window overlaps an existing pending or approved request for the employee.",
    );
  }
  const at = new Date().toISOString();
  const request = {
    ...original,
    id: original?.id || crypto.randomUUID(),
    employeeId: employee.id,
    employeeName: employee.name,
    department: employee.department,
    startDate: values.startDate,
    endDate: values.endDate,
    daysRequested,
    dayCounting: settings.dayCounting,
    reason,
    status: "PENDING",
    history: [
      ...(original?.history || []),
      { action: original ? "EDITED" : "CREATED", at, note: reason },
    ],
  };
  let requests;
  if (original) {
    requests = state.requests.map((item) => {
      if (item.id === request.id) return request;
      return item;
    });
  } else {
    requests = [request, ...state.requests];
  }
  return { ...state, requests };
}

export function saveLeaveEntitlement(
  state,
  employees,
  values,
  settings = INITIAL_LEAVE_SETTINGS,
  today = todayInNairobi(),
) {
  if (!employees.some((employee) => employee.id === values.employeeId))
    throw new Error("The employee is no longer available.");
  const original = state.balances.find(
    (item) => item.employeeId === values.employeeId,
  );
  const yearStart = original?.yearStart || getLeaveYear(today).start;
  if (values.yearStart && values.yearStart !== yearStart) {
    throw new Error(
      "The leave year has renewed. Close and reopen this form to adjust the new balance.",
    );
  }
  // Used leave is changed only by approval/reopening, never by entitlement edits.
  if (original && !getLeaveBalance(original))
    throw new Error(
      "The existing balance is invalid and must be reconciled before adjustment.",
    );
  const used = original?.used || 0;
  const accrued = Number(values.accrued);
  if (
    !/^\d+$/.test(String(values.accrued)) ||
    !Number.isSafeInteger(accrued) ||
    accrued < used ||
    accrued - used > Number(settings.maxBalance)
  ) {
    throw new Error(
      `Accrued days must leave a remaining balance between 0 and ${settings.maxBalance}. Used leave is ${used} days.`,
    );
  }
  const reason = validateDecisionNote(values.note, true);
  const balance = {
    ...original,
    employeeId: values.employeeId,
    yearStart,
    accrued,
    used,
    adjustments: [
      ...(original?.adjustments || []),
      {
        at: new Date().toISOString(),
        previousAccrued: original?.accrued ?? null,
        accrued,
        note: reason,
      },
    ],
  };
  let balances;
  if (original) {
    balances = state.balances.map((item) => {
      if (item.employeeId === values.employeeId) return balance;
      return item;
    });
  } else {
    balances = [...state.balances, balance];
  }
  return { ...state, balances };
}
