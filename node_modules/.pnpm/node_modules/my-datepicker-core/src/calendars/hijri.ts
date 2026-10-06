/**
 * Islamic / Hijri calendar arithmetic — Tabular (Kuwaiti) algorithm.
 *
 * This implements the "Tabular Islamic" calendar, also known as the
 * "Kuwaiti algorithm" or "arithmetic Islamic calendar".
 *
 * 30-year cycle with 11 leap years: {2,5,7,10,13,16,18,21,24,26,29}
 * In leap years, Dhul-Hijjah (month 12) has 30 days instead of 29.
 *
 * ⚠️  This differs from the observed (astronomical) Hijri calendar by ±1–2 days.
 *     The `hijriAdjustment` option allows correcting for local conventions.
 *
 * Epoch: 1 Muharram 1 AH = Julian 16 July 622 CE = JDN 1948439
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** JDN of 1 Muharram 1 AH (civil epoch, "Friday" variant). */
const HIJRI_EPOCH_JDN = 1948439;

/** Leap years within a 30-year Hijri cycle. */
const LEAP_YEARS_IN_CYCLE = new Set([2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29]);

// ---------------------------------------------------------------------------
// Leap year
// ---------------------------------------------------------------------------

/** Returns true if Hijri year `hy` is a leap year (Dhul-Hijjah = 30 days). */
export function isHijriLeap(hy: number): boolean {
  return LEAP_YEARS_IN_CYCLE.has(((hy % 30) + 30) % 30 || 30);
}

// ---------------------------------------------------------------------------
// Month lengths
// ---------------------------------------------------------------------------

/**
 * Number of days in Hijri month (hm: 1–12).
 *  Odd months (1,3,5,7,9,11): 30 days
 *  Even months (2,4,6,8,10):  29 days
 *  Month 12:                  29 (normal) or 30 (leap)
 */
export function hijriMonthLength(hy: number, hm: number): number {
  if (hm % 2 === 1) return 30;      // odd months: 30
  if (hm < 12) return 29;           // even months 2-10: 29
  return isHijriLeap(hy) ? 30 : 29; // month 12: 30 in leap year
}

/** Number of days in Hijri year hy (354 or 355). */
export function hijriYearLength(hy: number): number {
  return isHijriLeap(hy) ? 355 : 354;
}

// ---------------------------------------------------------------------------
// Cumulative month start within a year
// ---------------------------------------------------------------------------

/**
 * Day offset of the start of month hm within the year (0-indexed).
 * Equivalent to ceil(29.5 * (hm - 1)) without floating point risk.
 */
function monthStartOffset(hm: number): number {
  // Pattern: 0,30,59,89,118,148,177,207,236,266,295,325
  return Math.floor((59 * (hm - 1) + 1) / 2);
}

// ---------------------------------------------------------------------------
// JDN ↔ Hijri
// ---------------------------------------------------------------------------

/**
 * Convert Hijri date to Julian Day Number.
 * hm is 1-indexed. Applies optional day adjustment.
 */
export function hijriToJDN(
  hy: number,
  hm: number,
  hd: number,
  adjustment = 0
): number {
  return (
    HIJRI_EPOCH_JDN - 1 +
    (hy - 1) * 354 +
    Math.floor((11 * hy + 3) / 30) +
    monthStartOffset(hm) +
    hd +
    adjustment
  );
}

/**
 * Convert Julian Day Number to Hijri date { year, month, day }.
 * month is 1-indexed. Applies optional day adjustment.
 */
export function jdnToHijri(
  jdn: number,
  adjustment = 0
): { year: number; month: number; day: number } {
  const adjustedJDN = jdn - adjustment;

  // Estimate year from linear approximation
  // 1 Hijri year ≈ 354.367 days, one 30-year cycle = 10631 days
  const shifted = adjustedJDN - HIJRI_EPOCH_JDN;
  let hy = Math.max(1, Math.ceil((shifted * 30 + 29) / 10631));

  // Adjust year to be correct
  while (hijriToJDN(hy + 1, 1, 1) <= adjustedJDN) hy++;
  while (hijriToJDN(hy, 1, 1) > adjustedJDN) hy--;

  // Find month
  const dayInYear = adjustedJDN - hijriToJDN(hy, 1, 1) + 1;
  let hm = 1;
  while (hm < 12 && dayInYear > monthStartOffset(hm + 1)) hm++;

  // Find day
  const hd = dayInYear - monthStartOffset(hm);

  return { year: hy, month: hm, day: hd };
}

// ---------------------------------------------------------------------------
// Day of week
// ---------------------------------------------------------------------------

/** Day of week for a Hijri date. 0 = Sunday … 6 = Saturday. */
export function hijriDayOfWeek(hy: number, hm: number, hd: number): number {
  return (hijriToJDN(hy, hm, hd) + 1) % 7;
}
