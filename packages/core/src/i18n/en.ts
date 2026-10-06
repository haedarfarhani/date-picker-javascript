/**
 * English locale — Gregorian calendar
 */
import type { LocaleConfig } from '../types';

const en: LocaleConfig = {
  code: 'en-US',
  direction: 'ltr',
  days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  months: [
    '',
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
  monthsShort: [
    '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
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
  month: 'Month',
  year: 'Year',
  decade: 'Decade',
  calendar: 'gregorian',
  navPrev: '‹',
  navNext: '›',
  meridiem: { am: 'AM', pm: 'PM' },
};

export default en;
