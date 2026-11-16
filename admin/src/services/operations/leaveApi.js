import { leaveResponseSchema } from '../../utils/validation/operationsSchemas.js';
// Backend connection point. Replace these async method bodies with API calls.
// They currently return in-memory data so the UI works before the server exists.
// Contract and examples: admin/docs/leave-backend-handoff.md
import {
  INITIAL_LEAVE_REQUESTS,
  INITIAL_LEAVE_BALANCES,
  INITIAL_LEAVE_SETTINGS,
  INITIAL_EMPLOYEES,
} from "../../utils/constants/constants.js";
import {
  decideLeave,
  countLeaveDays,
  getLeaveBalance,
  normalizeLeaveSettings,
  saveLeaveEntitlement,
  saveLeaveRequest,
  validateLeaveSettings,
} from "./leaveService.js";
import { isValidDate } from "../../utils/validation/validators.js";
import {
  isLeaveYearStart,
  renewAnnualLeave,
  todayInEthiopia,
} from "./leaveYear.js";

// Each method resolves to { requests, balances, settings } after success.
// The second argument is local context, NOT a request body to send to the server.
export function createLeaveApi({ now = () => new Date() } = {}) {
  function refreshData({ data, employees }) {
    const validatedData = validateLeaveResponse(data);
    return renewAnnualLeave(validatedData, employees, now());
  }

  return {
    async load({ employees = INITIAL_EMPLOYEES } = {}) {
      const data = structuredClone({
        requests: INITIAL_LEAVE_REQUESTS,
        balances: INITIAL_LEAVE_BALANCES,
        settings: INITIAL_LEAVE_SETTINGS,
      });
      return refreshData({ data, employees });
    },

    async refresh(context) {
      return refreshData(context);
    },

    async saveRequest(input, context) {
      const data = refreshData(context);
      const today = todayInEthiopia(now());
      return saveLeaveRequest(
        data,
        context.employees,
        input,
        data.settings,
        today,
      );
    },

    async decideRequest(input, context) {
      const data = refreshData(context);
      return decideLeave(data, context.employees, input, data.settings);
    },

    async saveSettings(input, context) {
      const data = refreshData(context);
      const errors = validateLeaveSettings(input, data.balances);
      if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
      return { ...data, settings: normalizeLeaveSettings(input) };
    },

    async saveEntitlement(input, context) {
      const data = refreshData(context);
      if (!isLeaveYearStart(input.yearStart)) {
        throw new Error(
          "A valid leave year is required for an entitlement adjustment.",
        );
      }
      const today = todayInEthiopia(now());
      return saveLeaveEntitlement(
        data,
        context.employees,
        input,
        data.settings,
        today,
      );
    },
  };
}

// Reject malformed responses instead of showing misleading empty/default data.
// This checks the UI contract; authorization and business rules belong on the server.
export function validateLeaveResponse(data) {
  if (
    !leaveResponseSchema.safeParse(data).success ||
    Object.keys(validateLeaveSettings(data.settings)).length
  ) {
    throw new Error(
      "Leave data could not be loaded. Please try again or contact support.",
    );
  }

  const validRequests = data.requests.every(isLeaveRequestValid);
  const validBalances = data.balances.every(isLeaveBalanceValid);
  const uniqueRequests =
    new Set(data.requests.map((request) => request?.id)).size ===
    data.requests.length;
  const uniqueBalances =
    new Set(data.balances.map((balance) => balance?.employeeId)).size ===
    data.balances.length;
  if (!validRequests || !validBalances || !uniqueRequests || !uniqueBalances) {
    throw new Error(
      "Leave records are incomplete or duplicated. Please contact support.",
    );
  }
  return { ...data, settings: normalizeLeaveSettings(data.settings) };
}

function isNonEmptyText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isOptionalText(value) {
  return value == null || typeof value === "string";
}

function isTimestamp(value) {
  return (
    typeof value === "string" &&
    /T.*(?:Z|[+-]\d{2}:\d{2})$/i.test(value) &&
    !Number.isNaN(Date.parse(value))
  );
}

function isLeaveRequestValid(request) {
  if (
    !request ||
    !isNonEmptyText(request.id) ||
    !isNonEmptyText(request.employeeId)
  )
    return false;
  if (!["PENDING", "APPROVED", "REJECTED"].includes(request.status))
    return false;
  if (
    !isValidDate(request.startDate) ||
    !isValidDate(request.endDate) ||
    request.endDate < request.startDate
  )
    return false;
  if (
    !Number.isInteger(request.daysRequested) ||
    request.daysRequested <= 0 ||
    request.daysRequested > countLeaveDays(request.startDate, request.endDate)
  )
    return false;

  if (request.dayCounting != null) {
    if (!["calendar", "weekdays"].includes(request.dayCounting)) return false;
    const expectedDays = countLeaveDays(
      request.startDate,
      request.endDate,
      request.dayCounting,
    );
    if (request.daysRequested !== expectedDays) return false;
  }

  if (
    !isOptionalText(request.reason) ||
    !isOptionalText(request.employeeName) ||
    !isOptionalText(request.department) ||
    !isOptionalText(request.decisionNote)
  )
    return false;
  if (request.decidedAt != null && !isTimestamp(request.decidedAt))
    return false;
  return isLeaveHistoryValid(request.history);
}

function isLeaveBalanceValid(balance) {
  if (
    !balance ||
    !isNonEmptyText(balance.employeeId) ||
    !getLeaveBalance(balance)
  )
    return false;
  if (!isLeaveYearStart(balance.yearStart)) return false;
  return (
    areAdjustmentsValid(balance.adjustments) && isAnnualHistoryValid(balance)
  );
}

function isLeaveHistoryValid(history) {
  if (history == null) return true;
  if (!Array.isArray(history)) return false;
  return history.every(
    (entry) =>
      entry &&
      isNonEmptyText(entry.action) &&
      isTimestamp(entry.at) &&
      isOptionalText(entry.note),
  );
}

function areAdjustmentsValid(adjustments) {
  if (adjustments == null) return true;
  if (!Array.isArray(adjustments)) return false;
  return adjustments.every(
    (entry) =>
      entry &&
      isTimestamp(entry.at) &&
      Number.isInteger(entry.accrued) &&
      (entry.previousAccrued === null ||
        Number.isInteger(entry.previousAccrued)) &&
      isOptionalText(entry.note),
  );
}

function isAnnualHistoryValid(balance) {
  const history = balance.annualHistory;
  if (history == null) return true;
  if (!Array.isArray(history)) return false;
  const validEntries = history.every(
    (entry) =>
      entry &&
      isLeaveYearStart(entry.yearStart) &&
      entry.yearStart < balance.yearStart &&
      getLeaveBalance(entry) &&
      entry.expiredDays === entry.accrued - entry.used &&
      isTimestamp(entry.closedAt),
  );
  if (!validEntries) return false;
  return (
    new Set(history.map((entry) => entry.yearStart)).size === history.length
  );
}

export default createLeaveApi();
