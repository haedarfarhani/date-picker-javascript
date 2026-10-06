/**
 * formatter.ts — Date formatter and parser with 20+ tokens.
 *
 * Tokens supported:
 *   YYYY  full year         YY  2-digit year
 *   MM    month 01-12       M   month 1-12
 *   MMMM  full month name   MMM short month name
 *   DD    day 01-31         D   day 1-31
 *   Do    day with ordinal  (1st/۱م)
 *   dddd  full weekday      ddd short weekday
 *   dd    minimal weekday
 *   HH    hour 00-23        H   hour 0-23
 *   hh    hour 01-12        h   hour 1-12
 *   mm    minute 00-59      ss  second 00-59
 *   a     am/pm lowercase   A   AM/PM uppercase
 *   W     ISO week number
 *   DDD   day of year (001-366)
 *   E     ISO day of week (1=Mon, 7=Sun)
 *   x     unix timestamp ms
 *   [text] literal
 */

import type { CalendarDate, CalendarType, LocaleConfig, NumeralSystem, TimeValue } from './types';
import { gregorianToJDN, gregorianWeekNumber, gregorianDayOfYear, gregorianDayOfWeek } from './calendars/gregorian';
import { toGregorian } from './convert';

// ---------------------------------------------------------------------------
// Numeral systems
// ---------------------------------------------------------------------------

const NUMERAL_MAPS: Record<NumeralSystem, string> = {
  latn:    '0123456789',
  arab:    '٠١٢٣٤٥٦٧٨٩',
  arabext: '۰۱۲۳۴۵۶۷۸۹',
};

export function toLocalDigits(str: string | number, system: NumeralSystem): string {
  if (system === 'latn') return String(str);
  const map = NUMERAL_MAPS[system];
  return String(str).replace(/\d/g, (d) => map[parseInt(d)]);
}

/** Normalize Arabic/Persian digits to ASCII (for parsing). */
export function normalizeDigits(str: string): string {
  return str
    .replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (c) => String(c.charCodeAt(0) - 0x06f0));
}

// ---------------------------------------------------------------------------
// Ordinal suffix
// ---------------------------------------------------------------------------

function ordinalSuffix(n: number, locale: LocaleConfig): string {
  if (locale.code.startsWith('fa') || locale.code.startsWith('ar')) {
    return `${n}م`;
  }
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ---------------------------------------------------------------------------
// Token regex
// ---------------------------------------------------------------------------

// Order matters: longer tokens first
const TOKEN_RE = /\[([^\]]*)\]|YYYY|YY|MMMM|MMM|MM|M|DDDD|DDD|DD|D(?!d)|dddd|ddd|dd|Do|HH|H|hh|h|mm|ss|a|A|W|E|x/g;

// ---------------------------------------------------------------------------
// Format
// ---------------------------------------------------------------------------

export interface FormatContext {
  calDate: CalendarDate;
  locale: LocaleConfig;
  numeralSystem?: NumeralSystem;
  time?: TimeValue;
}

/**
 * Format a CalendarDate with a format string.
 * `calDate` contains year/month/day in the target calendar.
 */
export function formatDate(fmt: string, ctx: FormatContext): string {
  const { calDate, locale, time } = ctx;
  const ns: NumeralSystem = ctx.numeralSystem ?? 'latn';

  // Convert to Gregorian to get JS Date capabilities (weekday, DOY, etc.)
  const g = toGregorian(calDate);
  const gYear = g.year, gMonth = g.month, gDay = g.day;

  const pad = (n: number, w = 2) => toLocalDigits(String(n).padStart(w, '0'), ns);
  const num = (n: number) => toLocalDigits(n, ns);

  const { year, month, day } = calDate;
  const hour24 = time?.hour ?? 0;
  const hour12 = hour24 % 12 || 12;
  const minute = time?.minute ?? 0;
  const second = time?.second ?? 0;
  const isAM = hour24 < 12;
  const meridiemLow = isAM ? (locale.meridiem?.am ?? 'am') : (locale.meridiem?.pm ?? 'pm');
  const meridiemUp = meridiemLow.toUpperCase();

  // Day of week (0=Sun … 6=Sat) for the Gregorian equivalent
  const dowSun0 = gregorianDayOfWeek(gYear, gMonth, gDay);
  // ISO day of week (1=Mon … 7=Sun)
  const isoDay = dowSun0 === 0 ? 7 : dowSun0;

  // Week number (ISO)
  const weekNum = gregorianWeekNumber(gYear, gMonth, gDay);

  // Day of year
  const doy = gregorianDayOfYear(gYear, gMonth, gDay);

  // Unix timestamp ms
  const ts = Date.UTC(gYear, gMonth - 1, gDay, hour24, minute, second);

  return fmt.replace(TOKEN_RE, (token, literal?: string) => {
    if (literal !== undefined) return literal; // [literal text]
    switch (token) {
      case 'YYYY': return num(year);
      case 'YY':   return num(year).slice(-2);
      case 'MMMM': return locale.months[month] ?? String(month);
      case 'MMM':  return locale.monthsShort[month] ?? String(month);
      case 'MM':   return pad(month);
      case 'M':    return num(month);
      case 'DD':   return pad(day);
      case 'D':    return num(day);
      case 'Do':   return ordinalSuffix(day, locale);
      case 'dddd': return locale.days[dowSun0] ?? '';
      case 'ddd':  return locale.daysShort[dowSun0] ?? '';
      case 'dd':   return locale.daysMin[dowSun0] ?? '';
      case 'HH':   return pad(hour24);
      case 'H':    return num(hour24);
      case 'hh':   return pad(hour12);
      case 'h':    return num(hour12);
      case 'mm':   return pad(minute);
      case 'ss':   return pad(second);
      case 'a':    return meridiemLow;
      case 'A':    return meridiemUp;
      case 'W':    return num(weekNum);
      case 'DDD':  return pad(doy, 3);
      case 'E':    return num(isoDay);
      case 'x':    return String(ts);
      default:     return token;
    }
  });
}

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

interface ParsedFields {
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  second?: number;
  isPM?: boolean;
}

/**
 * Parse a date string using a format string and locale.
 * Returns a CalendarDate, or null on failure.
 */
export function parseDate(
  input: string,
  fmt: string,
  locale: LocaleConfig,
  calendar: CalendarType = 'gregorian'
): CalendarDate | null {
  // Normalize digits
  const normalizedInput = normalizeDigits(input.trim());

  // Build a regex from the format string, capturing each token
  const fields: ParsedFields = {};
  const tokenNames: string[] = [];
  let regexStr = '^';

  let lastIndex = 0;
  TOKEN_RE.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = TOKEN_RE.exec(fmt)) !== null) {
    // Escape any literal text between previous token and this one
    regexStr += escapeRegex(fmt.slice(lastIndex, match.index));
    lastIndex = TOKEN_RE.lastIndex;

    const token = match[0];
    const literal = match[1];

    if (literal !== undefined) {
      regexStr += escapeRegex(literal);
      tokenNames.push('literal');
      continue;
    }

    tokenNames.push(token);
    switch (token) {
      case 'YYYY':
        regexStr += '(\\d{4})'; break;
      case 'YY':
        regexStr += '(\\d{2})'; break;
      case 'MMMM':
      case 'MMM': {
        // Match any month name
        const names = (token === 'MMMM' ? locale.months : locale.monthsShort)
          .filter(Boolean).map(escapeRegex).join('|');
        regexStr += `(${names})`; break;
      }
      case 'MM': regexStr += '(\\d{2})'; break;
      case 'M':  regexStr += '(\\d{1,2})'; break;
      case 'DD': regexStr += '(\\d{2})'; break;
      case 'D':  regexStr += '(\\d{1,2})'; break;
      case 'Do': regexStr += '(\\d{1,2}\\S*)'; break;
      case 'HH': regexStr += '(\\d{2})'; break;
      case 'H':  regexStr += '(\\d{1,2})'; break;
      case 'hh': regexStr += '(\\d{2})'; break;
      case 'h':  regexStr += '(\\d{1,2})'; break;
      case 'mm': regexStr += '(\\d{2})'; break;
      case 'ss': regexStr += '(\\d{2})'; break;
      case 'a':
      case 'A': {
        const am = escapeRegex(locale.meridiem?.am ?? 'am');
        const pm = escapeRegex(locale.meridiem?.pm ?? 'pm');
        regexStr += `(${am}|${pm}|AM|PM|am|pm)`; break;
      }
      default:
        regexStr += '\\S*'; tokenNames[tokenNames.length - 1] = '_skip'; break;
    }
  }

  regexStr += escapeRegex(fmt.slice(lastIndex)) + '$';
  TOKEN_RE.lastIndex = 0;

  const re = new RegExp(regexStr, 'i');
  const m = normalizedInput.match(re);
  if (!m) return null;

  let groupIndex = 1;
  for (const name of tokenNames) {
    if (name === 'literal' || name === '_skip') { groupIndex++; continue; }
    const val = m[groupIndex++];
    if (!val) continue;

    switch (name) {
      case 'YYYY': fields.year = parseInt(val, 10); break;
      case 'YY': {
        const yy = parseInt(val, 10);
        fields.year = yy + (yy >= 70 ? 1900 : 2000); break;
      }
      case 'MMMM': {
        const idx = locale.months.findIndex((n) => n === val);
        if (idx > 0) fields.month = idx; break;
      }
      case 'MMM': {
        const idx = locale.monthsShort.findIndex((n) => n === val);
        if (idx > 0) fields.month = idx; break;
      }
      case 'MM': case 'M': fields.month = parseInt(val, 10); break;
      case 'DD': case 'D': fields.day = parseInt(val, 10); break;
      case 'Do': fields.day = parseInt(val, 10); break;
      case 'HH': case 'H': fields.hour = parseInt(val, 10); break;
      case 'hh': case 'h': fields.hour = parseInt(val, 10); break;
      case 'mm': fields.minute = parseInt(val, 10); break;
      case 'ss': fields.second = parseInt(val, 10); break;
      case 'a': case 'A': {
        const lower = val.toLowerCase();
        const pmStr = (locale.meridiem?.pm ?? 'pm').toLowerCase();
        fields.isPM = lower === pmStr || lower === 'pm'; break;
      }
    }
  }

  // Apply 12h → 24h conversion
  if (fields.hour !== undefined && fields.isPM !== undefined) {
    if (fields.isPM && fields.hour < 12) fields.hour += 12;
    if (!fields.isPM && fields.hour === 12) fields.hour = 0;
  }

  const year = fields.year;
  const month = fields.month;
  const day = fields.day;

  if (!year || !month || !day) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  return { year, month, day, calendar };
}

// ---------------------------------------------------------------------------
// ISO string utilities
// ---------------------------------------------------------------------------

/** Format a CalendarDate as ISO-style "YYYY-MM-DD" (in the date's own calendar). */
export function toISOString(d: CalendarDate): string {
  const y = String(d.year).padStart(4, '0');
  const m = String(d.month).padStart(2, '0');
  const day = String(d.day).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Parse an ISO-style "YYYY-MM-DD" string.
 * calendar hints which calendar the year/month/day belong to.
 */
export function fromISOString(s: string, calendar: CalendarType = 'gregorian'): CalendarDate | null {
  const norm = normalizeDigits(s.trim());
  const m = norm.match(/^(\d{1,4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return null;
  const year = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  const day = parseInt(m[3], 10);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day, calendar };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---------------------------------------------------------------------------
// Format presets
// ---------------------------------------------------------------------------

export const FORMAT_PRESETS: Record<string, Record<string, string>> = {
  fa: {
    full:     'dddd D MMMM YYYY',
    short:    'YYYY/MM/DD',
    iso:      'YYYY-MM-DD',
    numeric:  'YYYY/MM/DD',
    time:     'HH:mm',
    datetime: 'YYYY/MM/DD HH:mm',
  },
  en: {
    full:     'dddd, MMMM D, YYYY',
    short:    'MM/DD/YYYY',
    iso:      'YYYY-MM-DD',
    datetime: 'YYYY-MM-DD HH:mm',
  },
  ar: {
    full:     'dddd D MMMM YYYY',
    iso:      'YYYY-MM-DD',
    datetime: 'YYYY-MM-DD HH:mm',
  },
};
