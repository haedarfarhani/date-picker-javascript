export type CalendarType = 'jalali' | 'hijri' | 'gregorian';
export type DateMode = 'single' | 'multiple' | 'range';
export type FirstDayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type Theme = 'light' | 'dark' | 'material' | 'ios' | 'glass';
export type Design = 'default' | 'rounded' | 'minimal' | 'bordered' | 'compact';
export type Layout = 'popup' | 'inline' | 'multi-month';
export type TimeFormat = '12h' | '24h';
export type NumeralSystem = 'latn' | 'arabext' | 'arab';
export type HijriPreset = 'tabular' | 'umm-alqura' | 'iranian';

export interface BaseCalendarDate {
  year: number;
  month: number;
  day: number;
}

export interface GregorianDate extends BaseCalendarDate {
  calendar: 'gregorian';
}

export interface JalaliDate extends BaseCalendarDate {
  calendar: 'jalali';
}

export interface HijriDate extends BaseCalendarDate {
  calendar: 'hijri';
}

export type CalendarDate = GregorianDate | JalaliDate | HijriDate;

export interface TimeValue {
  hour: number;
  minute: number;
  second: number;
  millisecond?: number;
}

export interface LocaleConfig {
  code: string;
  direction: 'ltr' | 'rtl';
  days: string[];
  daysShort?: string[];
  daysMin?: string[];
  months: string[];
  monthsShort?: string[];
  firstDay: FirstDayOfWeek;
  today: string;
  select: string;
  clear: string;
  cancel: string;
  ok: string;
  placeholder: string;
  rangeSeparator: string;
  startDate: string;
  endDate: string;
  week: string;
  weekDay?: string[];
  month: string;
  year: string;
  decade?: string;
  calendar: CalendarType;
  navPrev?: string;
  navNext?: string;
  meridiem?: { am: string; pm: string };
}

// Forward reference for SmartDate type in options
export type SmartDateInput = any;

export interface DatePickerOptions {
  calendar?: CalendarType;
  calendarSwitcher?: boolean;
  mode?: DateMode;
  value?: string | string[] | any;
  minDate?: string | any;
  maxDate?: string | any;
  disabledDates?: (string | any)[] | ((d: any) => boolean);
  disabledWeekdays?: number[];
  firstDayOfWeek?: FirstDayOfWeek;
  pattern?: string;
  format?: string;
  parse?: (input: string) => any | null;
  showTime?: boolean;
  timeFormat?: TimeFormat;
  hijriAdjustment?: number;
  hijriPreset?: HijriPreset;
  layout?: Layout;
  monthsCount?: number;
  theme?: Theme;
  design?: Design;
  locale?: string | Partial<LocaleConfig>;
  dir?: 'rtl' | 'ltr' | 'auto';
  numeralSystem?: NumeralSystem;
  inline?: boolean;
  placeholder?: string;
  zIndex?: number;
}

export interface DatePickerInstance {
  open(): void;
  close(): void;
  toggle(): void;
  destroy(): void;
  getValue(): string | string[] | null;
  getSmartDate(): any | any[] | { start: any; end: any } | null;
  setValue(v: any): void;
  clear(): void;
  setLocale(l: string): void;
  switchCalendar(c: CalendarType): void;
  formatDate(d: any, pattern?: string, calendar?: CalendarType): string;
  parseDate(s: string, pattern?: string, calendar?: CalendarType): any | null;
  on(event: string, cb: (payload: any) => void): () => void;
  update(options: Partial<DatePickerOptions>): void;
}

export interface CalendarCell {
  date: Date;
  smartDate?: any;
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

export type DatePickerEvent =
  | 'open'
  | 'close'
  | 'change'
  | 'select'
  | 'clear'
  | 'navigate'
  | 'calendar-change'
  | 'error';
