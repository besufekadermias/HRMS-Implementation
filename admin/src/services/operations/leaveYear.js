import { isValidDate } from "../../utils/validation/validators.js";
import {
  INITIAL_LEAVE_SETTINGS,
  MAX_LEAVE_BALANCE,
} from "../../utils/constants/constants.js";

export const LEAVE_TIME_ZONE = "Africa/Addis_Ababa";
const DAY_MS = 86400000;
const ethiopianCalendar = new Intl.DateTimeFormat("en-u-ca-ethiopic-nu-latn", {
  timeZone: "UTC",
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

export function todayInEthiopia(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: LEAVE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  return ["year", "month", "day"]
    .map((type) => parts.find((part) => part.type === type).value)
    .join("-");
}

// Date inputs are Gregorian ISO dates; the leave period follows the Ethiopian
// calendar, including Pagume 6. Never hard-code September 11 as New Year.
export function getLeaveYear(date = todayInEthiopia()) {
  if (!isValidDate(date))
    throw new Error("A valid date is required for the leave year.");
  const instant = new Date(`${date}T00:00:00Z`);
  const parts = ethiopianCalendar.formatToParts(instant);
  const year = Number(parts.find((part) => part.type === "year").value);
  const month = Number(parts.find((part) => part.type === "month").value);
  const day = Number(parts.find((part) => part.type === "day").value);
  const elapsedDays = (month - 1) * 30 + day - 1;
  const start = instant.getTime() - elapsedDays * DAY_MS;
  let daysInYear = 365;
  if (year % 4 === 3) daysInYear = 366;
  const next = start + daysInYear * DAY_MS;
  return {
    year,
    start: new Date(start).toISOString().slice(0, 10),
    end: new Date(next - DAY_MS).toISOString().slice(0, 10),
    nextStart: new Date(next).toISOString().slice(0, 10),
  };
}

export function isLeaveYearStart(date) {
  return isValidDate(date) && getLeaveYear(date).start === date;
}

export function needsLeaveRefresh(data, employees, today = todayInEthiopia()) {
  if (!data) return false;
  const period = getLeaveYear(today);
  const owners = new Set(data.balances.map((balance) => balance.employeeId));
  return (
    data.balances.some((balance) => balance.yearStart !== period.start) ||
    employees.some((employee) => !owners.has(employee.id))
  );
}

export function renewAnnualLeave(state, employees, now = new Date()) {
  const settings = state.settings ?? INITIAL_LEAVE_SETTINGS;
  const entitlement = Number(settings.defaultEntitlement);
  const cap = Number(settings.maxBalance);
  if (
    !Number.isInteger(entitlement) ||
    !Number.isInteger(cap) ||
    entitlement < 1 ||
    entitlement > cap ||
    cap > MAX_LEAVE_BALANCE
  ) {
    throw new Error(
      "Annual entitlement must fit within the configured balance cap before renewal.",
    );
  }
  const period = getLeaveYear(todayInEthiopia(now));
  let changed = false;
  const balances = [];
  for (const balance of state.balances) {
    if (
      !isLeaveYearStart(balance.yearStart) ||
      !Number.isInteger(balance.accrued) ||
      !Number.isInteger(balance.used) ||
      balance.used < 0 ||
      balance.accrued < balance.used
    ) {
      throw new Error(
        "The leave balance needs a valid year and reconciled days before renewal.",
      );
    }
    if (balance.yearStart > period.start)
      throw new Error(
        "The leave balance is ahead of the current Ethiopian year.",
      );
    if (balance.yearStart === period.start) {
      balances.push(balance);
      continue;
    }
    changed = true;
    balances.push(closeExpiredLeaveYear(balance, period, entitlement, now));
  }
  const owners = new Set(balances.map((balance) => balance.employeeId));
  for (const employee of employees) {
    if (owners.has(employee.id)) continue;
    changed = true;
    owners.add(employee.id);
    balances.push({
      employeeId: employee.id,
      yearStart: period.start,
      accrued: entitlement,
      used: 0,
    });
  }
  if (!changed) return state;
  return { ...state, balances };
}

function closeExpiredLeaveYear(balance, period, entitlement, now) {
  const expiredDays = balance.accrued - balance.used;
  const previousPeriod = getLeaveYear(balance.yearStart);
  return {
    ...balance,
    yearStart: period.start,
    accrued: entitlement,
    used: 0,
    annualHistory: [
      ...(balance.annualHistory || []),
      {
        yearStart: balance.yearStart,
        accrued: balance.accrued,
        used: balance.used,
        expiredDays,
        closedAt: `${previousPeriod.nextStart}T00:00:00+03:00`,
      },
    ],
    adjustments: [
      ...(balance.adjustments || []),
      {
        action: "ANNUAL_RENEWAL",
        at: now.toISOString(),
        previousAccrued: balance.accrued,
        accrued: entitlement,
        yearStart: period.start,
        note: `${expiredDays} unused days expired. ${entitlement} days granted for ${period.year} E.C.; no carryover.`,
      },
    ],
  };
}
