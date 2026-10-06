/**
 * Arabic locale — Hijri calendar
 */
import type { LocaleConfig } from '../types';

const ar: LocaleConfig = {
  code: 'ar-SA',
  direction: 'rtl',
  days: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  daysShort: ['أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'],
  daysMin: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  months: [
    '',
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر',
    'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
    'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة',
  ],
  monthsShort: [
    '',
    'محر', 'صفر', 'ربع١', 'ربع٢',
    'جمد١', 'جمد٢', 'رجب', 'شعب',
    'رمض', 'شوا', 'قعد', 'حجة',
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
  month: 'شهر',
  year: 'سنة',
  decade: 'عقد',
  calendar: 'hijri',
  navPrev: '›',
  navNext: '‹',
  meridiem: { am: 'ص', pm: 'م' },
};

export default ar;
