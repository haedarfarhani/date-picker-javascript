import type { CalendarType, FirstDayOfWeek } from './types';
import { getLocale } from './i18n';
import { SmartDate } from './SmartDate';
import { SmartDateFormat, normalizeDigits } from './SmartDateFormat';
import { jalaliToJDN, jdnToJalali, jalaliMonthLength } from './calendars/jalali';
import { hijriToJDN, jdnToHijri, hijriMonthLength } from './calendars/hijri';
import { gregorianToJDN, jdnToGregorian, gregorianMonthLength } from './calendars/gregorian';

export interface CalendarDay {
  date: Date;
  smartDate?: SmartDate;
  day: number;
  month: number;
  year: number;
  calendar?: CalendarType;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  isInRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
}

export function ISOFromDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isDateDisabled(
  date: Date,
  limits: {
    minDate: Date | null;
    maxDate: Date | null;
    disabledDates: Set<string>;
    disabledDateFn: ((d: Date) => boolean) | null;
  }
): boolean {
  return isDisabledDate(date, limits.minDate, limits.maxDate, limits.disabledDates, limits.disabledDateFn);
}

export function parseDateValue(input: string, calendar: CalendarType = 'gregorian'): Date | null {
  const parsed = parseDate(input, undefined, calendar);
  return parsed.length > 0 ? parsed[0] : null;
}

export function dateEquals(a: Date, b: Date): boolean {
  return isSameDay(a, b);
}

export function toCalendarComponents(
  date: Date,
  calendar: CalendarType = 'gregorian'
): { year: number; month: number; day: number } | null {
  const sd = new SmartDate(date);
  if (calendar === 'jalali') {
    return { year: sd.getShYear(), month: sd.getShMonth() - 1, day: sd.getShDay() };
  }
  if (calendar === 'hijri') {
    return { year: sd.getHjYear(), month: sd.getHjMonth() - 1, day: sd.getHjDay() };
  }
  return { year: sd.getGrgYear(), month: sd.getGrgMonth() - 1, day: sd.getGrgDay() };
}

export function buildCalendarMonth(
  year: number,
  month: number,
  firstDay: FirstDayOfWeek = 0,
  calendar: CalendarType = 'gregorian',
  limits?: {
    minDate: Date | null;
    maxDate: Date | null;
    disabledDates: Set<string>;
    disabledDateFn: ((d: Date) => boolean) | null;
  }
) {
  const days = generateMonthDays(
    year,
    month,
    [],
    limits?.minDate || null,
    limits?.maxDate || null,
    limits?.disabledDates || new Set(),
    limits?.disabledDateFn || null,
    'en-US',
    calendar
  );

  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return {
    year,
    month,
    calendar,
    weeks,
    firstDayOfMonth: { day: 1, month, year },
  };
}

export function formatDate(date: Date | SmartDate, format: string, calendar: CalendarType = 'gregorian'): string {
  const d = date instanceof SmartDate ? date : new SmartDate(date);

  // If format uses PHP tokens (like Y, m, d, l, F, etc.)
  if (/[YymdjnltwzLHgghisAa]/.test(format) && !format.includes('YYYY')) {
    return new SmartDateFormat(format).format(d, calendar);
  }

  // Legacy format string support (YYYY, MM, DD)
  let year = d.getGrgYear();
  let month = d.getGrgMonth();
  let day = d.getGrgDay();

  if (calendar === 'jalali') {
    year = d.getShYear();
    month = d.getShMonth();
    day = d.getShDay();
  } else if (calendar === 'hijri') {
    year = d.getHjYear();
    month = d.getHjMonth();
    day = d.getHjDay();
  }

  const mStr = String(month).padStart(2, '0');
  const dStr = String(day).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', mStr)
    .replace('DD', dStr);
}

export function parseDate(
  value: string | string[] | any,
  pattern?: string,
  calendar: CalendarType = 'gregorian'
): Date[] {
  if (!value) return [];

  const parseSingle = (v: string): Date | null => {
    if (!v || typeof v !== 'string') return null;
    const clean = normalizeDigits(v.trim());

    // Try standard YYYY-MM-DD regex first
    const mIso = clean.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (mIso) {
      const y = parseInt(mIso[1], 10);
      const m = parseInt(mIso[2], 10);
      const d = parseInt(mIso[3], 10);
      if (m < 1 || m > 12 || d < 1 || d > 31) return null;
      if (calendar === 'jalali') {
        const sd = new SmartDate(0);
        sd.setShYear(y).setShMonth(m).setShDay(d);
        return sd.toDate();
      }
      if (calendar === 'hijri') {
        const sd = new SmartDate(0);
        sd.setHjYear(y).setHjMonth(m).setHjDay(d);
        return sd.toDate();
      }
      return new Date(y, m - 1, d);
    }

    try {
      const sd = SmartDateFormat.parse(clean, pattern, calendar);
      return sd.toDate();
    } catch {
      const dt = new Date(clean);
      return isNaN(dt.getTime()) ? null : dt;
    }
  };

  if (Array.isArray(value)) {
    return value.map(parseSingle).filter((d): d is Date => d !== null);
  }

  const d = parseSingle(value);
  return d ? [d] : [];
}

export function isSameDay(a: Date | SmartDate, b: Date | SmartDate): boolean {
  const t1 = a instanceof SmartDate ? a.toDate() : a;
  const t2 = b instanceof SmartDate ? b.toDate() : b;
  return (
    t1.getFullYear() === t2.getFullYear() &&
    t1.getMonth() === t2.getMonth() &&
    t1.getDate() === t2.getDate()
  );
}

export function isToday(date: Date | SmartDate): boolean {
  return isSameDay(date, new Date());
}

export function isDisabledDate(
  date: Date,
  minDate: Date | null,
  maxDate: Date | null,
  disabledDates: Set<string>,
  disabledDateFn: ((d: Date) => boolean) | null,
  disabledWeekdays: number[] = [],
  calendar: CalendarType = 'gregorian'
): boolean {
  if (minDate) {
    const dStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const minStart = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()).getTime();
    if (dStart < minStart) return true;
  }

  if (maxDate) {
    const dStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const maxStart = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate()).getTime();
    if (dStart > maxStart) return true;
  }

  const iso = formatDate(date, 'YYYY-MM-DD', calendar);
  if (disabledDates.has(iso) || disabledDates.has(formatDate(date, 'YYYY-MM-DD', 'gregorian'))) {
    return true;
  }

  if (disabledDateFn && disabledDateFn(date)) {
    return true;
  }

  if (disabledWeekdays && disabledWeekdays.length > 0) {
    const sd = new SmartDate(date);
    const dow = sd.dayOfWeek(calendar);
    if (disabledWeekdays.includes(dow) || disabledWeekdays.includes(date.getDay())) {
      return true;
    }
  }

  return false;
}

export function getDaysInMonth(year: number, month: number, calendar: CalendarType = 'gregorian'): number {
  // Support both 0-indexed (0..11) and 1-indexed (1..12) month inputs
  const m1 = month >= 0 && month <= 11 ? month + 1 : month;

  if (calendar === 'jalali') {
    return jalaliMonthLength(year, m1);
  }
  if (calendar === 'hijri') {
    return hijriMonthLength(year, m1);
  }
  return gregorianMonthLength(year, m1);
}

export function getWeekdayNames(localeCode: string, firstDay: FirstDayOfWeek): string[] {
  const locale = getLocale(localeCode);
  const days = [...locale.days];
  for (let i = 0; i < firstDay; i++) {
    const day = days.shift();
    if (day) days.push(day);
  }
  return days;
}

export function generateMonthDays(
  year: number,
  month: number, // 0-indexed month
  selectedDates: Date[],
  minDate: Date | null,
  maxDate: Date | null,
  disabledDates: Set<string>,
  disabledDateFn: ((d: Date) => boolean) | null,
  localeCode: string,
  calendar: CalendarType = 'gregorian',
  disabledWeekdays: number[] = [],
  mode: 'single' | 'multiple' | 'range' = 'single'
): CalendarDay[] {
  const days: CalendarDay[] = [];
  const locale = getLocale(localeCode);
  const firstDayOfWeek = locale.firstDay ?? (calendar === 'jalali' ? 6 : 0);

  const m1 = month + 1; // 1-indexed active month
  const totalDaysInMonth = getDaysInMonth(year, month, calendar);

  // Determine starting day of week for the 1st of this month
  let firstDayDate: Date;
  if (calendar === 'jalali') {
    const jdn = jalaliToJDN(year, m1, 1);
    const g = jdnToGregorian(jdn);
    firstDayDate = new Date(g.year, g.month - 1, g.day);
  } else if (calendar === 'hijri') {
    const jdn = hijriToJDN(year, m1, 1);
    const g = jdnToGregorian(jdn);
    firstDayDate = new Date(g.year, g.month - 1, g.day);
  } else {
    firstDayDate = new Date(year, month, 1);
  }

  let startCol = (firstDayDate.getDay() - firstDayOfWeek + 7) % 7;

  // Previous month cells
  const prevMonth1 = m1 === 1 ? 12 : m1 - 1;
  const prevYear = m1 === 1 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth1 - 1, calendar);

  for (let i = startCol - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    let cellDate: Date;

    if (calendar === 'jalali') {
      const jdn = jalaliToJDN(prevYear, prevMonth1, d);
      const g = jdnToGregorian(jdn);
      cellDate = new Date(g.year, g.month - 1, g.day);
    } else if (calendar === 'hijri') {
      const jdn = hijriToJDN(prevYear, prevMonth1, d);
      const g = jdnToGregorian(jdn);
      cellDate = new Date(g.year, g.month - 1, g.day);
    } else {
      cellDate = new Date(prevYear, prevMonth1 - 1, d);
    }

    const smart = new SmartDate(cellDate);
    const isSelected = selectedDates.some((sd) => isSameDay(sd, cellDate));
    const rangeInfo = calculateRangeFlags(cellDate, selectedDates, mode);

    days.push({
      date: cellDate,
      smartDate: smart,
      day: d,
      month: prevMonth1 - 1,
      year: prevYear,
      calendar,
      isCurrentMonth: false,
      isToday: isToday(cellDate),
      isSelected,
      isDisabled: isDisabledDate(cellDate, minDate, maxDate, disabledDates, disabledDateFn, disabledWeekdays, calendar),
      isInRange: rangeInfo.isInRange,
      isRangeStart: rangeInfo.isRangeStart,
      isRangeEnd: rangeInfo.isRangeEnd,
    });
  }

  // Current month cells
  for (let d = 1; d <= totalDaysInMonth; d++) {
    let cellDate: Date;

    if (calendar === 'jalali') {
      const jdn = jalaliToJDN(year, m1, d);
      const g = jdnToGregorian(jdn);
      cellDate = new Date(g.year, g.month - 1, g.day);
    } else if (calendar === 'hijri') {
      const jdn = hijriToJDN(year, m1, d);
      const g = jdnToGregorian(jdn);
      cellDate = new Date(g.year, g.month - 1, g.day);
    } else {
      cellDate = new Date(year, month, d);
    }

    const smart = new SmartDate(cellDate);
    const isSelected = selectedDates.some((sd) => isSameDay(sd, cellDate));
    const rangeInfo = calculateRangeFlags(cellDate, selectedDates, mode);

    days.push({
      date: cellDate,
      smartDate: smart,
      day: d,
      month,
      year,
      calendar,
      isCurrentMonth: true,
      isToday: isToday(cellDate),
      isSelected,
      isDisabled: isDisabledDate(cellDate, minDate, maxDate, disabledDates, disabledDateFn, disabledWeekdays, calendar),
      isInRange: rangeInfo.isInRange,
      isRangeStart: rangeInfo.isRangeStart,
      isRangeEnd: rangeInfo.isRangeEnd,
    });
  }

  // Next month cells to complete grid row (multiple of 7, up to 35 or 42)
  const totalCells = Math.ceil(days.length / 7) * 7;
  const remaining = totalCells - days.length;
  const nextMonth1 = m1 === 12 ? 1 : m1 + 1;
  const nextYear = m1 === 12 ? year + 1 : year;

  for (let d = 1; d <= remaining; d++) {
    let cellDate: Date;

    if (calendar === 'jalali') {
      const jdn = jalaliToJDN(nextYear, nextMonth1, d);
      const g = jdnToGregorian(jdn);
      cellDate = new Date(g.year, g.month - 1, g.day);
    } else if (calendar === 'hijri') {
      const jdn = hijriToJDN(nextYear, nextMonth1, d);
      const g = jdnToGregorian(jdn);
      cellDate = new Date(g.year, g.month - 1, g.day);
    } else {
      cellDate = new Date(nextYear, nextMonth1 - 1, d);
    }

    const smart = new SmartDate(cellDate);
    const isSelected = selectedDates.some((sd) => isSameDay(sd, cellDate));
    const rangeInfo = calculateRangeFlags(cellDate, selectedDates, mode);

    days.push({
      date: cellDate,
      smartDate: smart,
      day: d,
      month: nextMonth1 - 1,
      year: nextYear,
      calendar,
      isCurrentMonth: false,
      isToday: isToday(cellDate),
      isSelected,
      isDisabled: isDisabledDate(cellDate, minDate, maxDate, disabledDates, disabledDateFn, disabledWeekdays, calendar),
      isInRange: rangeInfo.isInRange,
      isRangeStart: rangeInfo.isRangeStart,
      isRangeEnd: rangeInfo.isRangeEnd,
    });
  }

  return days;
}

function calculateRangeFlags(
  date: Date,
  selectedDates: Date[],
  mode: 'single' | 'multiple' | 'range'
): { isInRange: boolean; isRangeStart: boolean; isRangeEnd: boolean } {
  if (mode !== 'range' || selectedDates.length === 0) {
    return { isInRange: false, isRangeStart: false, isRangeEnd: false };
  }

  const dTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const d0 = new Date(selectedDates[0].getFullYear(), selectedDates[0].getMonth(), selectedDates[0].getDate()).getTime();

  if (selectedDates.length === 1) {
    return {
      isInRange: false,
      isRangeStart: dTime === d0,
      isRangeEnd: false,
    };
  }

  const d1 = new Date(selectedDates[1].getFullYear(), selectedDates[1].getMonth(), selectedDates[1].getDate()).getTime();
  const start = Math.min(d0, d1);
  const end = Math.max(d0, d1);

  return {
    isRangeStart: dTime === start,
    isRangeEnd: dTime === end,
    isInRange: dTime > start && dTime < end,
  };
}
