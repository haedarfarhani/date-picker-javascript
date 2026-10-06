import { describe, it, expect } from 'vitest';
import { SmartDate } from '../src/SmartDate';

describe('SmartDate Unified Engine', () => {
  describe('Constructors & Factories', () => {
    it('creates from now, timestamp, and JS Date', () => {
      const now = SmartDate.now();
      expect(now.getTime()).toBeGreaterThan(0);

      const ts = 1775458000000;
      const fromTs = SmartDate.fromTimestamp(ts);
      expect(fromTs.getTime()).toBe(ts);

      const d = new Date(2026, 9, 6, 14, 30, 0);
      const fromD = SmartDate.fromDate(d);
      expect(fromD.getGrgYear()).toBe(2026);
      expect(fromD.getGrgMonth()).toBe(10);
      expect(fromD.getGrgDay()).toBe(6);
      expect(fromD.getHour()).toBe(14);
      expect(fromD.getMinute()).toBe(30);
    });

    it('creates copy from existing SmartDate', () => {
      const orig = new SmartDate();
      orig.setShYear(1403).setShMonth(7).setShDay(14);
      const copy = new SmartDate(orig);
      expect(copy.getShYear()).toBe(1403);
      expect(copy.getShMonth()).toBe(7);
      expect(copy.getShDay()).toBe(14);
      expect(copy.getTime()).toBe(orig.getTime());
    });
  });

  describe('Getters and Setters Sync', () => {
    it('synchronizes Jalali setter to Gregorian and Hijri', () => {
      const sd = new SmartDate(0);
      // 1403-07-14 Jalali = 2024-10-05 Gregorian
      sd.setShYear(1403).setShMonth(7).setShDay(14);

      expect(sd.getShYear()).toBe(1403);
      expect(sd.getShMonth()).toBe(7);
      expect(sd.getShDay()).toBe(14);

      expect(sd.getGrgYear()).toBe(2024);
      expect(sd.getGrgMonth()).toBe(10);
      expect(sd.getGrgDay()).toBe(5);

      // Verify Hijri is in year 1446
      expect(sd.getHjYear()).toBe(1446);
    });

    it('synchronizes Gregorian setter to Jalali', () => {
      const sd = new SmartDate(0);
      sd.setGrgYear(2026).setGrgMonth(3).setGrgDay(21); // Nowruz 1405
      expect(sd.getShYear()).toBe(1405);
      expect(sd.getShMonth()).toBe(1);
      expect(sd.getShDay()).toBe(1);
    });

    it('synchronizes Hijri setters', () => {
      const sd = new SmartDate(0);
      sd.setHjYear(1445).setHjMonth(9).setHjDay(1); // Ramadan 1445
      expect(sd.getHjYear()).toBe(1445);
      expect(sd.getHjMonth()).toBe(9);
      expect(sd.getHjDay()).toBe(1);
    });

    it('manages time setters', () => {
      const sd = new SmartDate(0);
      sd.setHour(18).setMinute(45).setSecond(30);
      expect(sd.getHour()).toBe(18);
      expect(sd.getMinute()).toBe(45);
      expect(sd.getSecond()).toBe(30);
    });
  });

  describe('Conversion Methods', () => {
    it('converts to Jalali, Gregorian, and Hijri arrays', () => {
      const sd = new SmartDate(0);
      sd.setGrgYear(2024).setGrgMonth(10).setGrgDay(5);

      expect(sd.toJalali()).toEqual([1403, 7, 14]);
      expect(sd.toGregorian()).toEqual([2024, 10, 5]);

      // Static conversions
      expect(SmartDate.toJalali(2024, 10, 5)).toEqual([1403, 7, 14]);
      expect(SmartDate.toGregorian(1403, 7, 14)).toEqual([2024, 10, 5]);

      // Cross Hijri conversions
      const [hy, hm, hd] = sd.toHijri();
      const backFromHj = SmartDate.toGregorianFromHijri(hy, hm, hd);
      expect(backFromHj).toEqual([2024, 10, 5]);
    });
  });

  describe('Calendar Calculations & Days', () => {
    it('checks leap status for each calendar', () => {
      const sd = new SmartDate(0);
      sd.setShYear(1403).setShMonth(1).setShDay(1);
      expect(sd.isLeap('jalali')).toBe(true);

      sd.setGrgYear(2024).setGrgMonth(1).setGrgDay(1);
      expect(sd.grgIsLeap()).toBe(true);

      sd.setGrgYear(2023).setGrgMonth(1).setGrgDay(1);
      expect(sd.grgIsLeap()).toBe(false);
    });

    it('returns day of week (0=Saturday for Jalali, 0=Sunday for Gregorian)', () => {
      // 2024-10-05 was Saturday
      const sd = new SmartDate(0);
      sd.setGrgYear(2024).setGrgMonth(10).setGrgDay(5);
      expect(sd.dayOfWeek('jalali')).toBe(0); // شنبه
      expect(sd.dayName('jalali')).toBe('شنبه');
      expect(sd.dayName('gregorian')).toBe('Saturday');
    });

    it('returns month names and days in month', () => {
      const sd = new SmartDate(0);
      sd.setShYear(1403).setShMonth(7).setShDay(1);
      expect(sd.monthName('jalali')).toBe('مهر');
      expect(sd.getMonthDays('jalali')).toBe(30);

      sd.setShMonth(1);
      expect(sd.monthName('jalali')).toBe('فروردین');
      expect(sd.getMonthDays('jalali')).toBe(31);
    });
  });

  describe('Date Manipulation & Clamping Rule', () => {
    it('clamps 30 Esfand to last day of next month on addMonths', () => {
      // 1403 is leap: 30 Esfand 1403
      const sd = new SmartDate(0);
      sd.setShYear(1403).setShMonth(12).setShDay(30);

      // Add 1 month -> Farvardin (31 days)
      const plus1 = sd.addMonths(1, 'jalali');
      expect(plus1.getShYear()).toBe(1404);
      expect(plus1.getShMonth()).toBe(1);
      expect(plus1.getShDay()).toBe(30);

      // Now set to 31 Shahrivar and add 1 month -> Mehr has 30 days -> clamp to 30!
      const shahrivar31 = new SmartDate(0);
      shahrivar31.setShYear(1403).setShMonth(6).setShDay(31);
      const inMehr = shahrivar31.addMonths(1, 'jalali');
      expect(inMehr.getShMonth()).toBe(7);
      expect(inMehr.getShDay()).toBe(30); // Clamped, NOT 31 or 1 Aban!
    });

    it('adds and subtracts days and years', () => {
      const sd = new SmartDate(0);
      sd.setShYear(1403).setShMonth(1).setShDay(1);
      const nextDay = sd.addDays(1);
      expect(nextDay.getShDay()).toBe(2);

      const nextYear = sd.addYears(1, 'jalali');
      expect(nextYear.getShYear()).toBe(1404);

      const subbed = nextDay.subDays(1);
      expect(subbed.getShDay()).toBe(1);
    });

    it('computes start and end of day/month/year', () => {
      const sd = new SmartDate(0);
      sd.setShYear(1403).setShMonth(7).setShDay(15);
      sd.setHour(15).setMinute(30);

      const startD = sd.startOfDay();
      expect(startD.getHour()).toBe(0);
      expect(startD.getMinute()).toBe(0);

      const startM = sd.startOfMonth('jalali');
      expect(startM.getShDay()).toBe(1);

      const endM = sd.endOfMonth('jalali');
      expect(endM.getShDay()).toBe(30); // Mehr has 30 days
    });
  });

  describe('Comparison & Diff', () => {
    it('compares dates with before, after, equals, compare', () => {
      const d1 = new SmartDate(0);
      d1.setShYear(1403).setShMonth(1).setShDay(1);
      const d2 = new SmartDate(0);
      d2.setShYear(1403).setShMonth(1).setShDay(2);

      expect(d1.before(d2)).toBe(true);
      expect(d2.after(d1)).toBe(true);
      expect(d1.equals(d1)).toBe(true);
      expect(d1.compare(d2)).toBe(-1);
      expect(d2.compare(d1)).toBe(1);
    });

    it('calculates calendar difference between two dates', () => {
      const d1 = new SmartDate(0);
      d1.setShYear(1403).setShMonth(7).setShDay(14);
      const d2 = new SmartDate(0);
      d2.setShYear(1401).setShMonth(5).setShDay(10);

      const diff = d1.diff(d2, 'jalali');
      expect(diff.years).toBe(2);
      expect(diff.months).toBe(2);
      expect(diff.days).toBe(4);
    });
  });
});
