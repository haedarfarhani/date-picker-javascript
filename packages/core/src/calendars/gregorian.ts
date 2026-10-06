/**
 * Gregorian calendar arithmetic.
 * All month numbers are 1-indexed (January = 1).
 */

// ---------------------------------------------------------------------------
// Leap year
// ---------------------------------------------------------------------------

/** Returns true if `year` is a Gregorian leap year. */
export function isGregorianLeap(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// ---------------------------------------------------------------------------
// Month lengths
// ---------------------------------------------------------------------------

const MONTH_DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

/** Number of days in a Gregorian month (month: 1–12). */
export function gregorianMonthLength(year: number, month: number): number {
  if (month === 2 && isGregorianLeap(year)) return 29;
  return MONTH_DAYS[month];
}

/** Number of days in a Gregorian year. */
export function gregorianYearLength(year: number): number {
  return isGregorianLeap(year) ? 366 : 365;
}

// ---------------------------------------------------------------------------
// Day of year
// ---------------------------------------------------------------------------

/** 1-indexed day of year for a Gregorian date. */
export function gregorianDayOfYear(year: number, month: number, day: number): number {
  let doy = day;
  for (let m = 1; m < month; m++) doy += gregorianMonthLength(year, m);
  return doy;
}

// ---------------------------------------------------------------------------
// JDN (Julian Day Number) ↔ Gregorian
// ---------------------------------------------------------------------------

/**
 * Convert a Gregorian date to Julian Day Number.
 * Uses the proleptic Gregorian calendar.
 * Reference: JDN 2451545 = 1 January 2000 (J2000.0)
 */
export function gregorianToJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

/**
 * Convert a Julian Day Number to a Gregorian date { year, month, day }.
 * month is 1-indexed.
 */
export function jdnToGregorian(jdn: number): { year: number; month: number; day: number } {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return {
    day: e - Math.floor((153 * m + 2) / 5) + 1,
    month: m + 3 - 12 * Math.floor(m / 10),
    year: 100 * b + d - 4800 + Math.floor(m / 10),
  };
}

// ---------------------------------------------------------------------------
// Week number (ISO 8601)
// ---------------------------------------------------------------------------

/** ISO 8601 week number (1–53) for a Gregorian date. */
export function gregorianWeekNumber(year: number, month: number, day: number): number {
  const jdn = gregorianToJDN(year, month, day);
  const dow = ((jdn + 1) % 7) || 7; // 1=Mon … 7=Sun (ISO)
  const thursday = jdn + 4 - dow;
  const jan1 = gregorianToJDN(
    jdnToGregorian(thursday).year,
    1,
    1
  );
  return Math.floor((thursday - jan1) / 7) + 1;
}

/** Day of week: 0 = Sunday … 6 = Saturday. */
export function gregorianDayOfWeek(year: number, month: number, day: number): number {
  return (gregorianToJDN(year, month, day) + 1) % 7;
}
