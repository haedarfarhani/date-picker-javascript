/**
 * Islamic / Hijri calendar arithmetic — Tabular (Kuwaiti) algorithm.
 *
 * This implements the "Tabular Islamic" calendar, also known as the
 * "Kuwaiti algorithm" or "arithmetic Islamic calendar".
 *
 * 30-year cycle with 11 leap years: {2,5,7,10,13,16,18,21,24,26,29}
 * In leap years, Dhul-Hijjah (month 12) has 30 days instead of 29.
 *
 * Supports hijriAdjustment (± days) and presets:
 * 'tabular' | 'umm-alqura' | 'iranian'
 *
 * Epoch: 1 Muharram 1 AH = Julian 16 July 622 CE = JDN 1948439
 */

import type { HijriPreset } from '../types';

/** JDN of 1 Muharram 1 AH (civil epoch). */
export const HIJRI_EPOCH_JDN = 1948439;

/** Leap years within a 30-year Hijri cycle. */
export const HIJRI_LEAP_YEARS = new Set([2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29]);

/**
 * Resolves net adjustment in days given a preset and custom adjustment.
 */
export function resolveHijriAdjustment(
  preset: HijriPreset = 'tabular',
  userAdjustment = 0
): number {
  let presetOffset = 0;
  if (preset === 'umm-alqura') {
    presetOffset = -1;
  } else if (preset === 'iranian') {
    presetOffset = 0;
  }
  return presetOffset + (userAdjustment || 0);
}

/** Returns true if Hijri year `hy` is a leap year (Dhul-Hijjah = 30 days). */
export function isHijriLeap(hy: number): boolean {
  const mod = ((hy % 30) + 30) % 30 || 30;
  return HIJRI_LEAP_YEARS.has(mod);
}

/**
 * Number of days in Hijri month (hm: 1–12).
 *  Odd months (1,3,5,7,9,11): 30 days
 *  Even months (2,4,6,8,10):  29 days
 *  Month 12:                  29 (normal) or 30 (leap)
 */
export function hijriMonthLength(hy: number, hm: number): number {
  if (hm % 2 === 1) return 30;
  if (hm < 12) return 29;
  return isHijriLeap(hy) ? 30 : 29;
}

/** Number of days in Hijri year hy (354 or 355). */
export function hijriYearLength(hy: number): number {
  return isHijriLeap(hy) ? 355 : 354;
}

/**
 * Day offset of the start of month hm within the year (0-indexed).
 */
export function hijriMonthStartOffset(hm: number): number {
  return Math.floor((59 * (hm - 1) + 1) / 2);
}

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
    hijriMonthStartOffset(hm) +
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

  const shifted = adjustedJDN - HIJRI_EPOCH_JDN;
  let hy = Math.max(1, Math.ceil((shifted * 30 + 29) / 10631));

  while (hijriToJDN(hy + 1, 1, 1) <= adjustedJDN) hy++;
  while (hijriToJDN(hy, 1, 1) > adjustedJDN) hy--;

  const dayInYear = adjustedJDN - hijriToJDN(hy, 1, 1) + 1;
  let hm = 1;
  while (hm < 12 && dayInYear > hijriMonthStartOffset(hm + 1)) hm++;

  const hd = dayInYear - hijriMonthStartOffset(hm);

  return { year: hy, month: hm, day: hd };
}

/** Day of week for a Hijri date. 0 = Saturday (Al-Sabt), 1 = Sunday ... 6 = Friday. */
export function hijriDayOfWeek(hy: number, hm: number, hd: number, adjustment = 0): number {
  const jdn = hijriToJDN(hy, hm, hd, adjustment);
  return (jdn + 2) % 7;
}
