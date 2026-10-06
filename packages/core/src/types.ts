export type CalendarType = 'gregorian' | 'jalali' | 'hijri';
export type DateMode = 'single' | 'multiple' | 'range';
export type FirstDayOfWeek = 0 | 1 | 6;
export type Theme = 'light' | 'dark';
export type TimeFormat = '12h' | '24h';

export interface LocaleConfig {
  code: string;
  direction: 'ltr' | 'rtl';
  days: string[];
  months: string[];
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
  weekDay: string[];
  month: string;
  year: string;
  calendar: CalendarType;
  navPrev?: string;
  navNext?: string;
}

export interface DatePickerOptions {
  mode?: DateMode;
  value?: string | string[];
  minDate?: string;
  maxDate?: string;
  disabledDates?: string[] | ((d: Date) => boolean);
  firstDayOfWeek?: FirstDayOfWeek;
  locale?: string | Partial<LocaleConfig>;
  calendar?: CalendarType;
  format?: string;
  showTime?: boolean;
  timeFormat?: TimeFormat;
  inline?: boolean;
  placeholder?: string;
  theme?: Theme;
  zIndex?: number;
}

export interface DatePickerInstance {
  open(): void;
  close(): void;
  toggle(): void;
  destroy(): void;
  getValue(): string | string[] | null;
  setValue(v: string | string[]): void;
  clear(): void;
  setLocale(l: string): void;
  on(event: string, cb: (payload: any) => void): () => void;
  update(options: Partial<DatePickerOptions>): void;
}

export interface CalendarCell {
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

export type DatePickerEvent =
  | 'open'
  | 'close'
  | 'change'
  | 'select'
  | 'clear'
  | 'navigate'
  | 'error';