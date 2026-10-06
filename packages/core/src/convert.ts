/**
 * convert.ts — JDN-based conversion hub between Gregorian, Jalali, and Hijri.
 */

import type { CalendarDate, CalendarType, GregorianDate, JalaliDate, HijriDate } from './types';
import { gregorianToJDN, jdnToGregorian, isGregorianLeap, gregorianMonthLength, gregorianYearLength } from './calendars/gregorian';
import { jalaliToJDN, jdnToJalali, isJalaliLeap, jalaliMonthLength, jalaliYearLength } from './calendars/jalali';
import { hijriToJDN, jdnToHijri, isHijriLeap, hijriMonthLength, hijriYearLength } from './calendars/hijri';

// ---------------------------------------------------------------------------
// CalendarDate helpers
// ---------------------------------------------------------------------------

/** Convert a CalendarDate to Julian Day Number. */
export function toJDN(d: CalendarDate, hijriAdjustment = 0): number {
  switch (d.calendar) {
    case 'gregorian':
      return gregorianToJDN(d.year, d.month, d.day);
    case 'jalali':
      return jalaliToJDN(d.year, d.month, d.day);
    case 'hijri':
      return hijriToJDN(d.year, d.month, d.day, hijriAdjustment);
  }
}

/** Convert a Julian Day Number to CalendarDate in the requested calendar. */
export function fromJDN(jdn: number, calendar: CalendarType, hijriAdjustment = 0): CalendarDate {
  switch (calendar) {
    case 'gregorian': {
      const { year, month, day } = jdnToGregorian(jdn);
      return { year, month, day, calendar: 'gregorian' };
    }
    case 'jalali': {
      const { year, month, day } = jdnToJalali(jdn);
      return { year, month, day, calendar: 'jalali' };
    }
    case 'hijri': {
      const { year, month, day } = jdnToHijri(jdn, hijriAdjustment);
      return { year, month, day, calendar: 'hijri' };
    }
  }
}

// ---------------------------------------------------------------------------
// Cross-calendar conversions
// ---------------------------------------------------------------------------

export function toGregorian(d: CalendarDate, hijriAdjustment = 0): GregorianDate {
  const jdn = toJDN(d, hijriAdjustment);
  const { year, month, day } = jdnToGregorian(jdn);
  return { year, month, day, calendar: 'gregorian' };
}

export function toJalali(d: CalendarDate, hijriAdjustment = 0): JalaliDate {
  const jdn = toJDN(d, hijriAdjustment);
  const { year, month, day } = jdnToJalali(jdn);
  return { year, month, day, calendar: 'jalali' };
}

export function toHijri(d: CalendarDate, hijriAdjustment = 0): HijriDate {
  const jdn = toJDN(d, hijriAdjustment);
  const { year, month, day } = jdnToHijri(jdn, hijriAdjustment);
  return { year, month, day, calendar: 'hijri' };
}

// ---------------------------------------------------------------------------
// Calendar utilities
// ---------------------------------------------------------------------------

export function isLeapYear(calendar: CalendarType, year: number): boolean {
  switch (calendar) {
    case 'gregorian': return isGregorianLeap(year);
    case 'jalali': return isJalaliLeap(year);
    case 'hijri': return isHijriLeap(year);
  }
}

export function daysInMonth(calendar: CalendarType, year: number, month: number): number {
  switch (calendar) {
    case 'gregorian': return gregorianMonthLength(year, month);
    case 'jalali': return jalaliMonthLength(year, month);
    case 'hijri': return hijriMonthLength(year, month);
  }
}

export function daysInYear(calendar: CalendarType, year: number): number {
  switch (calendar) {
    case 'gregorian': return gregorianYearLength(year);
    case 'jalali': return jalaliYearLength(year);
    case 'hijri': return hijriYearLength(year);
  }
}

/** Return today as a CalendarDate in the given calendar. */
export function todayIn(calendar: CalendarType, hijriAdjustment = 0): CalendarDate {
  const now = new Date();
  const gy = now.getFullYear();
  const gm = now.getMonth() + 1;
  const gd = now.getDate();
  const jdn = gregorianToJDN(gy, gm, gd);
  return fromJDN(jdn, calendar, hijriAdjustment);
}

// ---------------------------------------------------------------------------
// Date comparison
// ---------------------------------------------------------------------------

/** Compare two CalendarDates by converting to JDN. Returns -1, 0, or 1. */
export function compareCalendarDates(
  a: CalendarDate,
  b: CalendarDate,
  hijriAdjustment = 0
): -1 | 0 | 1 {
  const jdnA = toJDN(a, hijriAdjustment);
  const jdnB = toJDN(b, hijriAdjustment);
  if (jdnA < jdnB) return -1;
  if (jdnA > jdnB) return 1;
  return 0;
}

/** Return true if two CalendarDates represent the same day. */
export function isSameDay(a: CalendarDate, b: CalendarDate, hijriAdjustment = 0): boolean {
  return compareCalendarDates(a, b, hijriAdjustment) === 0;
}

/** Gregorian JS Date → CalendarDate. */
export function fromJSDate(jsDate: Date, calendar: CalendarType, hijriAdjustment = 0): CalendarDate {
  const jdn = gregorianToJDN(jsDate.getFullYear(), jsDate.getMonth() + 1, jsDate.getDate());
  return fromJDN(jdn, calendar, hijriAdjustment);
}

/** CalendarDate → Gregorian JS Date. */
export function toJSDate(d: CalendarDate, hijriAdjustment = 0): Date {
  const g = toGregorian(d, hijriAdjustment);
  return new Date(g.year, g.month - 1, g.day);
}

// ---------------------------------------------------------------------------
// Calendar arithmetic
// ---------------------------------------------------------------------------

/** Add N days to a CalendarDate (returns same calendar). */
export function addDays(d: CalendarDate, n: number, hijriAdjustment = 0): CalendarDate {
  return fromJDN(toJDN(d, hijriAdjustment) + n, d.calendar, hijriAdjustment);
}

/** Add N months to a CalendarDate (clamped to month length). */
export function addMonths(d: CalendarDate, n: number, hijriAdjustment = 0): CalendarDate {
  let year = d.year;
  let month = d.month + n;

  while (month > 12) { month -= 12; year++; }
  while (month < 1) { month += 12; year--; }

  const maxDay = daysInMonth(d.calendar, year, month);
  const day = Math.min(d.day, maxDay);
  return { year, month, day, calendar: d.calendar };
}

/** Add N years to a CalendarDate (clamped to month length). */
export function addYears(d: CalendarDate, n: number, hijriAdjustment = 0): CalendarDate {
  const year = d.year + n;
  const maxDay = daysInMonth(d.calendar, year, d.month);
  const day = Math.min(d.day, maxDay);
  return { year, month: d.month, day, calendar: d.calendar };
}
