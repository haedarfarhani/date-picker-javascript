import type { CalendarType, FirstDayOfWeek } from './types';
import { getLocale } from './i18n';

export interface CalendarDay {
  date: Date;
  day: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  isInRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
}

export function formatDate(date: Date, format: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day);
}

export function parseDate(value: string | string[]): Date[] {
  if (Array.isArray(value)) {
    return value
      .filter((v) => /^\d{4}-\d{2}-\d{2}$/.test(v))
      .map((v) => {
        const [year, month, day] = v.split('-').map(Number);
        return new Date(year, month - 1, day);
      });
  }

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return [new Date(year, month - 1, day)];
  }

  return [];
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function isDisabledDate(
  date: Date,
  minDate: Date | null,
  maxDate: Date | null,
  disabledDates: Set<string>,
  disabledDateFn: ((d: Date) => boolean) | null
): boolean {
  if (minDate && date < minDate) {
    return true;
  }
  if (maxDate && date > maxDate) {
    return true;
  }
  if (disabledDates.has(formatDate(date, 'YYYY-MM-DD'))) {
    return true;
  }
  if (disabledDateFn && disabledDateFn(date)) {
    return true;
  }
  return false;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getWeekdayNames(localeCode: string, firstDay: FirstDayOfWeek): string[] {
  const locale = getLocale(localeCode);
  let days = [...locale.days];
  for (let i = 0; i < firstDay; i++) {
    const day = days.shift();
    if (day) {
      days.push(day);
    }
  }
  return days;
}

export function generateMonthDays(
  year: number,
  month: number,
  selectedDates: Date[],
  minDate: Date | null,
  maxDate: Date | null,
  disabledDates: Set<string>,
  disabledDateFn: ((d: Date) => boolean) | null,
  localeCode: string,
  calendar: CalendarType
): CalendarDay[] {
  const days: CalendarDay[] = [];

  const daysInMonth = getDaysInMonth(year, month);
  const firstOfMonth = new Date(year, month, 1);
  let startDay = firstOfMonth.getDay();

  const locale = getLocale(localeCode);
  const firstDayOfWeek = locale.firstDay;

  startDay = (startDay - firstDayOfWeek + 7) % 7;

  const daysInPrevMonth = getDaysInMonth(year, month - 1);

  for (let i = startDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const date = new Date(year, month - 1, day);

    days.push({
      date,
      day,
      month: month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false,
      isToday: isToday(date),
      isSelected: selectedDates.some((d) => isSameDay(d, date)),
      isDisabled: isDisabledDate(date, minDate, maxDate, disabledDates, disabledDateFn),
      isInRange: false,
      isRangeStart: false,
      isRangeEnd: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);

    days.push({
      date,
      day,
      month,
      year,
      isCurrentMonth: true,
      isToday: isToday(date),
      isSelected: selectedDates.some((d) => isSameDay(d, date)),
      isDisabled: isDisabledDate(date, minDate, maxDate, disabledDates, disabledDateFn),
      isInRange: false,
      isRangeStart: false,
      isRangeEnd: false,
    });
  }

  const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;
  const remaining = totalCells - days.length;

  for (let day = 1; day <= remaining; day++) {
    const date = new Date(year, month + 1, day);

    days.push({
      date,
      day,
      month: month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false,
      isToday: isToday(date),
      isSelected: selectedDates.some((d) => isSameDay(d, date)),
      isDisabled: isDisabledDate(date, minDate, maxDate, disabledDates, disabledDateFn),
      isInRange: false,
      isRangeStart: false,
      isRangeEnd: false,
    });
  }

  return days;
}