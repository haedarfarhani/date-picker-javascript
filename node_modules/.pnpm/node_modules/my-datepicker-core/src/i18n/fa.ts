/**
 * Farsi (Persian) locale — Jalali calendar
 */
import type { LocaleConfig } from '../types';

const fa: LocaleConfig = {
  code: 'fa-IR',
  direction: 'rtl',
  days: ['یکشنبه', 'دوشنبه', 'سهشنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'],
  daysShort: ['یک', 'دو', 'سه', 'چهار', 'پنج', 'جمعه', 'شنبه'],
  daysMin: ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'],
  months: [
    '', // index 0 unused
    'فروردین', 'اردیبهشت', 'خرداد',
    'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر',
    'دی', 'بهمن', 'اسفند',
  ],
  monthsShort: [
    '', 'فرو', 'ارد', 'خرد', 'تیر', 'مرد', 'شهر',
    'مهر', 'آبا', 'آذر', 'دی', 'بهم', 'اسف',
  ],
  firstDay: 6, // Saturday
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
  month: 'ماه',
  year: 'سال',
  decade: 'دهه',
  calendar: 'jalali',
  navPrev: '›',
  navNext: '‹',
  meridiem: { am: 'ق.ظ', pm: 'ب.ظ' },
};

export default fa;
