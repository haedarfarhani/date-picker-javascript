import type { LocaleConfig, CalendarType, FirstDayOfWeek } from './types';

const LOCALES: Record<string, LocaleConfig> = {
  'en-US': {
    code: 'en-US',
    direction: 'ltr',
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ],
    firstDay: 0,
    today: 'Today',
    select: 'Select',
    clear: 'Clear',
    cancel: 'Cancel',
    ok: 'OK',
    placeholder: 'Select date',
    rangeSeparator: ' to ',
    startDate: 'Start date',
    endDate: 'End date',
    week: 'Wk',
    weekDay: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    month: 'Month',
    year: 'Year',
    calendar: 'gregorian',
    navPrev: '‹',
    navNext: '›',
  },
  'fa-IR': {
    code: 'fa-IR',
    direction: 'rtl',
    days: ['یک', 'دو', 'سه', 'چهار', 'پنج', 'شنبه', 'یک'],
    months: [
      'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
      'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسف',
    ],
    firstDay: 6,
    today: 'امروز',
    select: 'انتخاب',
    clear: 'پاک کردن',
    cancel: 'لغو',
    ok: 'تایید',
    placeholder: 'تاریخ را انتخاب کنید',
    rangeSeparator: ' تا ',
    startDate: 'تاریخ شروع',
    endDate: 'تاریخ پایان',
    week: 'هفته',
    weekDay: ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'],
    month: 'ماه',
    year: 'سال',
    calendar: 'jalali',
    navPrev: '‹',
    navNext: '›',
  },
  'ar-SA': {
    code: 'ar-SA',
    direction: 'rtl',
    days: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
    months: [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
    ],
    firstDay: 6,
    today: 'اليوم',
    select: 'اختيار',
    clear: 'مسح',
    cancel: 'إلغاء',
    ok: 'موافق',
    placeholder: 'اختر تاريخ',
    rangeSeparator: ' إلى ',
    startDate: 'تاريخ البداية',
    endDate: 'تاريخ النهاية',
    week: 'أسبوع',
    weekDay: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
    month: 'شهر',
    year: 'سنة',
    calendar: 'gregorian',
    navPrev: '‹',
    navNext: '›',
  },
};

export function getLocale(code: string): LocaleConfig {
  const locale = LOCALES[code];
  if (locale) {
    return locale;
  }
  // Try to derive from code
  const parts = code.split('-');
  const base = parts[0];
  if (base === 'fa') {
    return LOCALES['fa-IR'];
  }
  if (base === 'ar') {
    return LOCALES['ar-SA'];
  }
  return LOCALES['en-US'];
}

export function mergeLocale(
  base: LocaleConfig,
  overrides?: Partial<LocaleConfig>
): LocaleConfig {
  if (!overrides) return base;
  return { ...base, ...overrides };
}

export function getCalendarForLocale(locale: LocaleConfig): CalendarType {
  return locale.calendar;
}

export function getFirstDayOfWeek(locale: LocaleConfig): FirstDayOfWeek {
  return locale.firstDay;
}