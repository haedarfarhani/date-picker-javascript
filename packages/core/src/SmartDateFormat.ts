/**
 * SmartDateFormat.ts — PHP-style formatting and parsing engine for SmartDate.
 *
 * Supports Jalali, Hijri, and Gregorian with PHP tokens (l, j, d, F, n, m, t, Y, y, w, z, L, H, g, h, i, s, a, A)
 * and parse tokens (yyyy, yy, MM, dd, HH, mm, ss, a).
 */

import type { CalendarType } from './types';
import { SmartDate } from './SmartDate';
import { jalaliMonthLength, isJalaliLeap } from './calendars/jalali';
import { hijriMonthLength, isHijriLeap } from './calendars/hijri';
import { gregorianMonthLength, isGregorianLeap } from './calendars/gregorian';

export class InvalidDateFormatError extends Error {
  position: number;
  token: string;

  constructor(message: string, position = -1, token = '') {
    super(message);
    this.name = 'InvalidDateFormatError';
    this.position = position;
    this.token = token;
  }
}

export const DEFAULT_PATTERNS: Record<
  CalendarType,
  { full: string; short: string; iso: string; datetime: string }
> = {
  jalali:    { full: 'l j F Y',   short: 'Y/m/d',  iso: 'Y-m-d',  datetime: 'Y/m/d H:i' },
  hijri:     { full: 'l j F Y',   short: 'Y/m/d',  iso: 'Y-m-d',  datetime: 'Y/m/d H:i' },
  gregorian: { full: 'l, j F Y',  short: 'm/d/Y',  iso: 'Y-m-d',  datetime: 'Y-m-d H:i' },
};

/** Normalize Persian and Arabic numerals to Latin digits. */
export function normalizeDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (c) => String(c.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x0660));
}

export class SmartDateFormat {
  private pattern: string;

  constructor(pattern: string = DEFAULT_PATTERNS.jalali.short) {
    this.pattern = pattern;
  }

  // ---------------------------------------------------------------------------
  // Format
  // ---------------------------------------------------------------------------

  format(date: SmartDate, calendar: CalendarType = 'jalali'): string {
    const pattern = this.pattern;

    let y: number;
    let m: number;
    let d: number;
    let leap: boolean;
    let daysInMonth: number;
    let dow: number;
    let doy0: number; // 0-indexed day of year
    let dayName: string;
    let monthName: string;

    if (calendar === 'jalali') {
      y = date.getShYear();
      m = date.getShMonth();
      d = date.getShDay();
      leap = isJalaliLeap(y);
      daysInMonth = jalaliMonthLength(y, m);
      dow = date.dayOfWeek('jalali');
      doy0 = date.getDayInYear('jalali') - 1;
      dayName = date.dayName('jalali');
      monthName = date.monthName('jalali');
    } else if (calendar === 'hijri') {
      y = date.getHjYear();
      m = date.getHjMonth();
      d = date.getHjDay();
      leap = isHijriLeap(y);
      daysInMonth = hijriMonthLength(y, m);
      dow = date.dayOfWeek('hijri');
      doy0 = date.getDayInYear('hijri') - 1;
      dayName = date.dayName('hijri');
      monthName = date.monthName('hijri');
    } else {
      y = date.getGrgYear();
      m = date.getGrgMonth();
      d = date.getGrgDay();
      leap = isGregorianLeap(y);
      daysInMonth = gregorianMonthLength(y, m);
      dow = date.dayOfWeek('gregorian');
      doy0 = date.getDayInYear('gregorian') - 1;
      dayName = date.dayName('gregorian');
      monthName = date.monthName('gregorian');
    }

    const H = date.getHour();
    const g = H % 12 || 12;
    const i = date.getMinute();
    const s = date.getSecond();
    const isPM = H >= 12;

    const pad2 = (n: number) => String(n).padStart(2, '0');

    // am/pm strings according to calendar/culture
    let amLower = 'am';
    let pmLower = 'pm';
    let amUpper = 'AM';
    let pmUpper = 'PM';

    if (calendar === 'jalali') {
      amLower = 'ق.ظ';
      pmLower = 'ب.ظ';
      amUpper = 'ق.ظ';
      pmUpper = 'ب.ظ';
    } else if (calendar === 'hijri') {
      amLower = 'ص';
      pmLower = 'م';
      amUpper = 'ص';
      pmUpper = 'م';
    }

    let result = '';
    let inLiteral = false;

    for (let idx = 0; idx < pattern.length; idx++) {
      const ch = pattern[idx];

      if (ch === '[') {
        inLiteral = true;
        continue;
      }
      if (ch === ']') {
        inLiteral = false;
        continue;
      }
      if (ch === '\\' && idx + 1 < pattern.length) {
        result += pattern[++idx];
        continue;
      }
      if (inLiteral) {
        result += ch;
        continue;
      }

      switch (ch) {
        case 'l': result += dayName; break;
        case 'j': result += String(d); break;
        case 'd': result += pad2(d); break;
        case 'F': result += monthName; break;
        case 'n': result += String(m); break;
        case 'm': result += pad2(m); break;
        case 't': result += String(daysInMonth); break;
        case 'Y': result += String(y); break;
        case 'y': result += String(y).slice(-2); break;
        case 'w': result += String(dow); break;
        case 'z': result += String(doy0); break;
        case 'L': result += leap ? '1' : '0'; break;
        case 'H': result += pad2(H); break;
        case 'g': result += String(g); break;
        case 'h': result += pad2(g); break;
        case 'i': result += pad2(i); break;
        case 's': result += pad2(s); break;
        case 'a': result += isPM ? pmLower : amLower; break;
        case 'A': result += isPM ? pmUpper : amUpper; break;
        default: result += ch; break;
      }
    }

    return result;
  }

  static format(date: SmartDate, pattern: string, calendar: CalendarType = 'jalali'): string {
    return new SmartDateFormat(pattern).format(date, calendar);
  }

  // ---------------------------------------------------------------------------
  // Parse
  // ---------------------------------------------------------------------------

  static parse(
    dateStr: string,
    pattern?: string,
    calendar: CalendarType = 'jalali'
  ): SmartDate {
    if (!dateStr || typeof dateStr !== 'string') {
      throw new InvalidDateFormatError('Input date string is empty or invalid', 0, '');
    }

    const cleanInput = normalizeDigits(dateStr.trim());

    if (!pattern) {
      // Try common default patterns
      const candidates = [
        'yyyy-MM-dd HH:mm:ss',
        'yyyy/MM/dd HH:mm:ss',
        'yyyy-MM-dd HH:mm',
        'yyyy/MM/dd HH:mm',
        'yyyy-MM-dd',
        'yyyy/MM/dd',
        'dd/MM/yyyy',
        'yyyy.MM.dd',
      ];
      for (const cand of candidates) {
        try {
          return SmartDateFormat.parseWithPattern(cleanInput, cand, calendar);
        } catch {
          // keep trying
        }
      }
      throw new InvalidDateFormatError(`Unable to parse "${dateStr}" with default patterns`, 0, '');
    }

    // Convert any PHP format tokens in pattern to parse tokens (e.g. Y-m-d -> yyyy-MM-dd)
    const normalizedPattern = SmartDateFormat.phpToParsePattern(pattern);
    try {
      return SmartDateFormat.parseWithPattern(cleanInput, normalizedPattern, calendar);
    } catch (err) {
      // If specified pattern failed, try default patterns as fallback
      const candidates = ['yyyy-MM-dd', 'yyyy/MM/dd', 'dd/MM/yyyy'];
      for (const cand of candidates) {
        try {
          return SmartDateFormat.parseWithPattern(cleanInput, cand, calendar);
        } catch {
          // continue
        }
      }
      throw err;
    }
  }

  private static phpToParsePattern(pattern: string): string {
    return pattern
      .replace(/(?<![a-zA-Z])YYYY(?![a-zA-Z])/g, 'yyyy')
      .replace(/(?<![a-zA-Z])YY(?![a-zA-Z])/g, 'yy')
      .replace(/(?<![a-zA-Z])DD(?![a-zA-Z])/g, 'dd')
      .replace(/(?<![a-zA-Z])Y(?![a-zA-Z])/g, 'yyyy')
      .replace(/(?<![a-zA-Z])y(?![a-zA-Z])/g, 'yy')
      .replace(/(?<![a-zA-Z])m(?![a-zA-Z])/g, 'MM')
      .replace(/(?<![a-zA-Z])n(?![a-zA-Z])/g, 'MM')
      .replace(/(?<![a-zA-Z])d(?![a-zA-Z])/g, 'dd')
      .replace(/(?<![a-zA-Z])j(?![a-zA-Z])/g, 'dd')
      .replace(/(?<![a-zA-Z])H(?![a-zA-Z])/g, 'HH')
      .replace(/(?<![a-zA-Z])i(?![a-zA-Z])/g, 'mm')
      .replace(/(?<![a-zA-Z])s(?![a-zA-Z])/g, 'ss');
  }

  static parseGrg(dateStr: string, pattern?: string): SmartDate {
    return SmartDateFormat.parse(dateStr, pattern, 'gregorian');
  }

  static parseHj(dateStr: string, pattern?: string): SmartDate {
    return SmartDateFormat.parse(dateStr, pattern, 'hijri');
  }

  static tryParseAny(dateStr: string): SmartDate | null {
    if (!dateStr || typeof dateStr !== 'string') return null;
    try {
      return SmartDateFormat.parse(dateStr);
    } catch {
      return null;
    }
  }

  private static parseWithPattern(
    input: string,
    pattern: string,
    calendar: CalendarType
  ): SmartDate {
    let year: number | null = null;
    let month: number | null = null;
    let day: number | null = null;
    let hour = 0;
    let minute = 0;
    let second = 0;
    let isPM: boolean | null = null;

    let inputIdx = 0;
    let patIdx = 0;

    while (patIdx < pattern.length) {
      const restPat = pattern.slice(patIdx);

      // Match parse tokens
      if (restPat.startsWith('yyyy')) {
        const match = input.slice(inputIdx).match(/^(\d{4})/);
        if (!match) {
          throw new InvalidDateFormatError(`Expected 4-digit year at position ${inputIdx}`, inputIdx, 'yyyy');
        }
        year = parseInt(match[1], 10);
        inputIdx += match[1].length;
        patIdx += 4;
      } else if (restPat.startsWith('yy')) {
        const match = input.slice(inputIdx).match(/^(\d{2})/);
        if (!match) {
          throw new InvalidDateFormatError(`Expected 2-digit year at position ${inputIdx}`, inputIdx, 'yy');
        }
        const yy = parseInt(match[1], 10);
        if (calendar === 'jalali') {
          year = yy >= 70 ? 1300 + yy : 1400 + yy;
        } else if (calendar === 'hijri') {
          year = 1400 + yy;
        } else {
          year = yy >= 70 ? 1900 + yy : 2000 + yy;
        }
        inputIdx += match[1].length;
        patIdx += 2;
      } else if (restPat.startsWith('MM')) {
        const match = input.slice(inputIdx).match(/^(\d{1,2})/);
        if (!match) {
          throw new InvalidDateFormatError(`Expected month at position ${inputIdx}`, inputIdx, 'MM');
        }
        month = parseInt(match[1], 10);
        inputIdx += match[1].length;
        patIdx += 2;
      } else if (restPat.startsWith('dd')) {
        const match = input.slice(inputIdx).match(/^(\d{1,2})/);
        if (!match) {
          throw new InvalidDateFormatError(`Expected day at position ${inputIdx}`, inputIdx, 'dd');
        }
        day = parseInt(match[1], 10);
        inputIdx += match[1].length;
        patIdx += 2;
      } else if (restPat.startsWith('HH')) {
        const match = input.slice(inputIdx).match(/^(\d{1,2})/);
        if (!match) {
          throw new InvalidDateFormatError(`Expected hour at position ${inputIdx}`, inputIdx, 'HH');
        }
        hour = parseInt(match[1], 10);
        inputIdx += match[1].length;
        patIdx += 2;
      } else if (restPat.startsWith('mm')) {
        const match = input.slice(inputIdx).match(/^(\d{1,2})/);
        if (!match) {
          throw new InvalidDateFormatError(`Expected minute at position ${inputIdx}`, inputIdx, 'mm');
        }
        minute = parseInt(match[1], 10);
        inputIdx += match[1].length;
        patIdx += 2;
      } else if (restPat.startsWith('ss')) {
        const match = input.slice(inputIdx).match(/^(\d{1,2})/);
        if (!match) {
          throw new InvalidDateFormatError(`Expected second at position ${inputIdx}`, inputIdx, 'ss');
        }
        second = parseInt(match[1], 10);
        inputIdx += match[1].length;
        patIdx += 2;
      } else if (restPat.startsWith('a')) {
        const sub = input.slice(inputIdx).toLowerCase();
        if (sub.startsWith('pm') || sub.startsWith('ب.ظ') || sub.startsWith('م')) {
          isPM = true;
          inputIdx += sub.startsWith('ب.ظ') ? 3 : sub.startsWith('pm') ? 2 : 1;
        } else if (sub.startsWith('am') || sub.startsWith('ق.ظ') || sub.startsWith('ص')) {
          isPM = false;
          inputIdx += sub.startsWith('ق.ظ') ? 3 : sub.startsWith('am') ? 2 : 1;
        }
        patIdx += 1;
      } else {
        const expChar = pattern[patIdx];
        if (input[inputIdx] !== expChar) {
          throw new InvalidDateFormatError(
            `Literal character "${expChar}" mismatch at position ${inputIdx} (got "${input[inputIdx]}")`,
            inputIdx,
            expChar
          );
        }
        inputIdx++;
        patIdx++;
      }
    }

    if (year === null || month === null || day === null) {
      throw new InvalidDateFormatError('Date requires at least year, month, and day', inputIdx, '');
    }

    // Bounds checking
    if (month < 1 || month > 12) {
      throw new InvalidDateFormatError(`Invalid month: ${month}`, inputIdx, 'MM');
    }

    let maxDays: number;
    if (calendar === 'jalali') {
      maxDays = jalaliMonthLength(year, month);
    } else if (calendar === 'hijri') {
      maxDays = hijriMonthLength(year, month);
    } else {
      maxDays = gregorianMonthLength(year, month);
    }

    if (day < 1 || day > maxDays) {
      throw new InvalidDateFormatError(
        `Invalid day: ${day} (month ${month} of year ${year} has ${maxDays} days)`,
        inputIdx,
        'dd'
      );
    }

    if (isPM !== null) {
      if (isPM && hour < 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;
    }

    const dt = new SmartDate(0);
    if (calendar === 'jalali') {
      dt.setShYear(year).setShMonth(month).setShDay(day);
    } else if (calendar === 'hijri') {
      dt.setHjYear(year).setHjMonth(month).setHjDay(day);
    } else {
      dt.setGrgYear(year).setGrgMonth(month).setGrgDay(day);
    }

    dt.setHour(hour).setMinute(minute).setSecond(second).setMillisecond(0);
    return dt;
  }
}
