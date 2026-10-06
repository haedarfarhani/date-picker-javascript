/**
 * Jalali (Solar Hijri / Persian) calendar arithmetic.
 *
 * Implements the Khayyam-Birashk algorithm with the standard breaks array,
 * accurate for Jalali years 1206–3000 (Gregorian 1827–3621).
 *
 * References:
 *   - Borkowski, K.M. (1996) "The Persian Calendar for 3000 Years"
 *   - Birashk, Ahmad (1993) "A Comparative Calendar of the Iranian, Muslim Lunar,
 *     and Christian Eras for Three Thousand Years"
 *
 * Leap years follow the 33-year Jalali cycle; the leap-year remainders within
 * each 2820-year grand cycle are: {1, 5, 9, 13, 17, 22, 26, 30}.
 */

import { gregorianToJDN, jdnToGregorian } from './gregorian';

// ---------------------------------------------------------------------------
// Break-point table (Birashk)
// ---------------------------------------------------------------------------

const BREAKS = [
  -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210,
  1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178,
] as const;

// ---------------------------------------------------------------------------
// jalCal — core Jalali calculation
// ---------------------------------------------------------------------------

/**
 * Given a Jalali year `jy`, compute:
 *  - `leap`:  0 if leap year (Esfand has 30 days), else 1..4
 *  - `gy`:    corresponding Gregorian year of Nowruz
 *  - `march`: day of March in which Nowruz falls (1-indexed; may be 20 or 21)
 */
export function jalCal(jy: number): { leap: number; gy: number; march: number } {
  const gy = jy + 621;
  let leapJ = -14;
  let jp = BREAKS[0];
  let jump = 0;
  let i: number;

  for (i = 1; i < BREAKS.length; i++) {
    const jb = BREAKS[i];
    jump = jb - jp;
    if (jy < jb) break;
    leapJ += Math.floor(jump / 33) * 8 + Math.floor(((jump % 33) + 3) / 4);
    jp = jb;
  }

  let n = jy - jp;
  leapJ += Math.floor(n / 33) * 8 + Math.floor(((n % 33) + 3) / 4);
  if ((jump % 33) === 4 && (jump - n) === 4) leapJ++;

  const leapG =
    Math.floor(gy / 4) -
    Math.floor((Math.floor(gy / 100) + 1) * 3 / 4) -
    150;

  const march = 20 + leapJ - leapG;

  if ((jump - n) < 6) {
    n -= jump - Math.ceil((jump + 6) / 33) * 33;
  }

  let leap = ((n + 1) % 33 - 1) % 4;
  if (leap === -1) leap = 4;

  return { leap, gy, march };
}

// ---------------------------------------------------------------------------
// Leap year
// ---------------------------------------------------------------------------

/** Returns true if Jalali year `jy` is a leap year (Esfand = 30 days). */
export function isJalaliLeap(jy: number): boolean {
  return jalCal(jy).leap === 0;
}

// ---------------------------------------------------------------------------
// Month lengths
// ---------------------------------------------------------------------------

/**
 * Number of days in Jalali month (jm: 1–12).
 *  Months 1–6: 31 days
 *  Months 7–11: 30 days
 *  Month 12: 29 (normal) or 30 (leap)
 */
export function jalaliMonthLength(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isJalaliLeap(jy) ? 30 : 29;
}

/** Number of days in Jalali year jy (365 or 366). */
export function jalaliYearLength(jy: number): number {
  return isJalaliLeap(jy) ? 366 : 365;
}

// ---------------------------------------------------------------------------
// Day of year
// ---------------------------------------------------------------------------

/** 1-indexed day of year for a Jalali date. */
export function jalaliDayOfYear(jm: number, jd: number): number {
  return (jm <= 6 ? (jm - 1) * 31 : (jm - 1) * 30 + 6) + jd;
}

// ---------------------------------------------------------------------------
// JDN ↔ Jalali
// ---------------------------------------------------------------------------

/**
 * Convert Jalali date to Julian Day Number.
 * jm is 1-indexed.
 */
export function jalaliToJDN(jy: number, jm: number, jd: number): number {
  const { gy, march } = jalCal(jy);
  // JDN of Nowruz (1 Farvardin of jy)
  const nowruzJDN = gregorianToJDN(gy, 3, march);
  // Offset within the year (0-indexed)
  const dayOffset = jalaliDayOfYear(jm, jd) - 1;
  return nowruzJDN + dayOffset;
}

/**
 * Convert Julian Day Number to Jalali date { year, month, day }.
 * month is 1-indexed.
 */
export function jdnToJalali(jdn: number): { year: number; month: number; day: number } {
  // Find Gregorian year to estimate Jalali year
  const g = jdnToGregorian(jdn);
  let jy = g.year - 621;

  // Adjust jy so that nowruz of jy <= jdn < nowruz of jy+1
  let nowruz = jalaliToJDN(jy, 1, 1);
  if (nowruz > jdn) {
    jy--;
    nowruz = jalaliToJDN(jy, 1, 1);
  }
  if (jalaliToJDN(jy + 1, 1, 1) <= jdn) {
    jy++;
    nowruz = jalaliToJDN(jy, 1, 1);
  }

  // Day within the Jalali year (1-indexed)
  const doy = jdn - nowruz + 1;

  // Find month and day from doy
  let jm: number;
  let jd: number;
  if (doy <= 186) {
    // Months 1–6 (31 days each)
    jm = Math.ceil(doy / 31);
    jd = doy - (jm - 1) * 31;
  } else {
    // Months 7–12 (30 days each, month 12 may be 29)
    const rem = doy - 186;
    jm = 6 + Math.ceil(rem / 30);
    jd = rem - (jm - 7) * 30;
  }

  return { year: jy, month: jm, day: jd };
}

// ---------------------------------------------------------------------------
// Day of week
// ---------------------------------------------------------------------------

/** Day of week for a Jalali date. 0 = Saturday (Persian week start). */
export function jalaliDayOfWeek(jy: number, jm: number, jd: number): number {
  const jdn = jalaliToJDN(jy, jm, jd);
  // Standard DOW: 0=Sun…6=Sat. Persian week starts on Saturday (6).
  // We return 0=Sat, 1=Sun, …, 6=Fri
  return (jdn + 2) % 7;
}
