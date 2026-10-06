import { describe, it, expect } from 'vitest';
import { SmartDate } from '../src/SmartDate';
import {
  SmartDateFormat,
  InvalidDateFormatError,
  normalizeDigits,
} from '../src/SmartDateFormat';

describe('SmartDateFormat Formatting & Parsing', () => {
  describe('Format Tokens (PHP-style)', () => {
    it('formats Jalali date tokens: l, j, d, F, n, m, t, Y, y, w, z, L', () => {
      // 1403-07-14 is Saturday
      const sd = new SmartDate(0);
      sd.setShYear(1403).setShMonth(7).setShDay(14);
      sd.setHour(14).setMinute(25).setSecond(9);

      const df = new SmartDateFormat('l j F Y');
      expect(df.format(sd, 'jalali')).toBe('شنبه 14 مهر 1403');

      expect(sd.format('Y/m/d', 'jalali')).toBe('1403/07/14');
      expect(sd.format('y-n-j', 'jalali')).toBe('03-7-14');
      expect(sd.format('t', 'jalali')).toBe('30'); // Mehr has 30 days
      expect(sd.format('L', 'jalali')).toBe('1'); // 1403 is leap
      expect(sd.format('w', 'jalali')).toBe('0'); // Saturday = 0 in Jalali
      expect(sd.format('H:i:s', 'jalali')).toBe('14:25:09');
      expect(sd.format('g:i a', 'jalali')).toBe('2:25 ب.ظ');
      expect(sd.format('h:i A', 'jalali')).toBe('02:25 ب.ظ');
    });

    it('formats Gregorian tokens accurately', () => {
      const sd = new SmartDate(0);
      sd.setGrgYear(2026).setGrgMonth(10).setGrgDay(6);
      sd.setHour(9).setMinute(5).setSecond(30);

      expect(sd.format('l, F j, Y', 'gregorian')).toBe('Tuesday, October 6, 2026');
      expect(sd.format('m/d/Y', 'gregorian')).toBe('10/06/2026');
      expect(sd.format('H:i:s', 'gregorian')).toBe('09:05:30');
      expect(sd.format('g:i a', 'gregorian')).toBe('9:05 am');
    });

    it('formats Hijri tokens accurately', () => {
      const sd = new SmartDate(0);
      sd.setHjYear(1445).setHjMonth(9).setHjDay(1); // Ramadan 1 1445

      const formatted = sd.format('l j F Y', 'hijri');
      expect(formatted).toContain('رمضان');
      expect(formatted).toContain('1445');
    });

    it('handles literals with brackets and backslashes', () => {
      const sd = new SmartDate(0);
      sd.setShYear(1403).setShMonth(1).setShDay(1);

      expect(sd.format('[سال] Y [ماه] m', 'jalali')).toBe('سال 1403 ماه 01');
      expect(sd.format('\\Y Y', 'jalali')).toBe('Y 1403');
    });
  });

  describe('Digit Normalization', () => {
    it('normalizes Persian and Arabic numerals to Latin digits', () => {
      expect(normalizeDigits('۱۴۰۳/۰۷/۱۴')).toBe('1403/07/14');
      expect(normalizeDigits('١٤٤٥-٠٩-٠١')).toBe('1445-09-01');
    });
  });

  describe('Parsing', () => {
    it('parses Jalali date strings with various patterns', () => {
      const parsed = SmartDateFormat.parse('1403-07-14', 'yyyy-MM-dd', 'jalali');
      expect(parsed.getShYear()).toBe(1403);
      expect(parsed.getShMonth()).toBe(7);
      expect(parsed.getShDay()).toBe(14);

      const parsedSlash = SmartDateFormat.parse('1403/07/14', 'yyyy/MM/dd', 'jalali');
      expect(parsedSlash.getShYear()).toBe(1403);
    });

    it('parses Persian numerals automatically', () => {
      const parsed = SmartDateFormat.parse('۱۴۰۳/۰۷/۱۴', 'yyyy/MM/dd', 'jalali');
      expect(parsed.getShYear()).toBe(1403);
      expect(parsed.getShMonth()).toBe(7);
      expect(parsed.getShDay()).toBe(14);
    });

    it('parses with time tokens (HH:mm:ss)', () => {
      const parsed = SmartDateFormat.parse('1403-07-14 16:45:30', 'yyyy-MM-dd HH:mm:ss', 'jalali');
      expect(parsed.getHour()).toBe(16);
      expect(parsed.getMinute()).toBe(45);
      expect(parsed.getSecond()).toBe(30);
    });

    it('parses Gregorian (parseGrg) and Hijri (parseHj)', () => {
      const grg = SmartDateFormat.parseGrg('2026-10-06');
      expect(grg.getGrgYear()).toBe(2026);
      expect(grg.getGrgMonth()).toBe(10);
      expect(grg.getGrgDay()).toBe(6);

      const hj = SmartDateFormat.parseHj('1445-09-01');
      expect(hj.getHjYear()).toBe(1445);
      expect(hj.getHjMonth()).toBe(9);
      expect(hj.getHjDay()).toBe(1);
    });

    it('throws InvalidDateFormatError for invalid date like 1403-12-31', () => {
      // Esfand 1403 has only 30 days
      expect(() => {
        SmartDateFormat.parse('1403-12-31', 'yyyy-MM-dd', 'jalali');
      }).toThrowError(InvalidDateFormatError);

      // Month out of range
      expect(() => {
        SmartDateFormat.parse('1403-13-01', 'yyyy-MM-dd', 'jalali');
      }).toThrowError(InvalidDateFormatError);

      // Malformed input
      expect(() => {
        SmartDateFormat.parse('invalid-date', 'yyyy-MM-dd', 'jalali');
      }).toThrowError(InvalidDateFormatError);
    });
  });
});
