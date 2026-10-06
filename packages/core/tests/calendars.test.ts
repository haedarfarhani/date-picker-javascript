import { describe, it, expect } from 'vitest';
import {
  isJalaliLeap,
  jalaliMonthLength,
  jalCal,
  jalaliToJDN,
  jdnToJalali,
  BREAKS,
} from '../src/calendars/jalali';
import {
  isGregorianLeap,
  gregorianMonthLength,
  gregorianToJDN,
  jdnToGregorian,
} from '../src/calendars/gregorian';
import {
  isHijriLeap,
  hijriMonthLength,
  hijriToJDN,
  jdnToHijri,
} from '../src/calendars/hijri';

describe('Calendars Engine & Leap Years', () => {
  describe('Boundary Leap Years', () => {
    it('verifies Jalali leap years (1399, 1403, 1408)', () => {
      expect(isJalaliLeap(1399)).toBe(true);
      expect(isJalaliLeap(1403)).toBe(true);
      expect(isJalaliLeap(1408)).toBe(true);

      // Non-leap Jalali years
      expect(isJalaliLeap(1400)).toBe(false);
      expect(isJalaliLeap(1401)).toBe(false);
      expect(isJalaliLeap(1402)).toBe(false);
    });

    it('verifies Gregorian leap years (2020, 2024, 2100)', () => {
      expect(isGregorianLeap(2020)).toBe(true);
      expect(isGregorianLeap(2024)).toBe(true);
      expect(isGregorianLeap(2100)).toBe(false); // Century non-400 rule
      expect(isGregorianLeap(2000)).toBe(true);
    });

    it('verifies Hijri leap years (1442, 1445 and cycle remainders)', () => {
      expect(isHijriLeap(1442)).toBe(true); // 1442 % 30 = 2
      expect(isHijriLeap(1445)).toBe(true); // 1445 % 30 = 5
      expect(isHijriLeap(1440)).toBe(false); // 1440 % 30 = 0
      expect(isHijriLeap(1444)).toBe(false); // 1444 % 30 = 4
      expect(isHijriLeap(2)).toBe(true);
      expect(isHijriLeap(5)).toBe(true);
      expect(isHijriLeap(7)).toBe(true);
    });

    it('checks Jalali breaks table integrity', () => {
      expect(BREAKS.length).toBe(20);
      expect(BREAKS[0]).toBe(-61);
      expect(BREAKS[BREAKS.length - 1]).toBe(3178);
    });
  });

  describe('Month Lengths', () => {
    it('returns 31 days for Jalali months 1 to 6', () => {
      for (let m = 1; m <= 6; m++) {
        expect(jalaliMonthLength(1403, m)).toBe(31);
      }
    });

    it('returns 30 days for Jalali months 7 to 11', () => {
      for (let m = 7; m <= 11; m++) {
        expect(jalaliMonthLength(1403, m)).toBe(30);
      }
    });

    it('returns 30 for Esfand in leap year and 29 in normal year', () => {
      expect(jalaliMonthLength(1403, 12)).toBe(30);
      expect(jalaliMonthLength(1402, 12)).toBe(29);
    });

    it('returns correct lengths for Gregorian and Hijri months', () => {
      expect(gregorianMonthLength(2024, 2)).toBe(29);
      expect(gregorianMonthLength(2023, 2)).toBe(28);
      expect(hijriMonthLength(1445, 12)).toBe(30); // Leap year Dhul-Hijjah
      expect(hijriMonthLength(1444, 12)).toBe(29);
    });
  });

  describe('Round-Trip JDN Conversions (1925–2075)', () => {
    it('converts Gregorian ↔ Jalali roundtrip without date loss', () => {
      // Sample key dates and step through range 1925 to 2075
      const step = 37; // Sample step through all 55,000 days
      const startJDN = gregorianToJDN(1925, 1, 1);
      const endJDN = gregorianToJDN(2075, 12, 31);

      for (let jdn = startJDN; jdn <= endJDN; jdn += step) {
        const g = jdnToGregorian(jdn);
        const jdnFromG = gregorianToJDN(g.year, g.month, g.day);
        expect(jdnFromG).toBe(jdn);

        const j = jdnToJalali(jdn);
        const jdnFromJ = jalaliToJDN(j.year, j.month, j.day);
        expect(jdnFromJ).toBe(jdn);

        const h = jdnToHijri(jdn);
        const jdnFromH = hijriToJDN(h.year, h.month, h.day);
        expect(jdnFromH).toBe(jdn);
      }
    });
  });
});
