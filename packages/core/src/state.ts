import type { DateMode, CalendarType, Theme } from './types';

export interface DatePickerState {
  viewDate: Date;
  viewMonth: number;
  viewYear: number;
  selectedDates: Date[];
  mode: DateMode;
  calendar: CalendarType;
  isOpen: boolean;
  showTime: boolean;
  timeFormat: '12h' | '24h';
  theme: Theme;
  firstDayOfWeek: number;
  locale: string;
  minDate: Date | null;
  maxDate: Date | null;
  disabledDates: Set<string>;
  disabledDateFn: ((d: Date) => boolean) | null;
  format: string;
  inline: boolean;
  placeholder: string;
  zIndex: number;
}

export class StateManager {
  private state: DatePickerState;

  constructor(initial: Partial<DatePickerState> = {}) {
    this.state = {
      viewDate: initial.viewDate || new Date(),
      viewMonth: initial.viewMonth ?? new Date().getMonth(),
      viewYear: initial.viewYear ?? new Date().getFullYear(),
      selectedDates: initial.selectedDates || [],
      mode: initial.mode || 'single',
      calendar: initial.calendar || 'gregorian',
      isOpen: initial.isOpen || false,
      showTime: initial.showTime || false,
      timeFormat: initial.timeFormat || '24h',
      theme: initial.theme || 'light',
      firstDayOfWeek: initial.firstDayOfWeek ?? 0,
      locale: initial.locale || 'en-US',
      minDate: initial.minDate || null,
      maxDate: initial.maxDate || null,
      disabledDates: initial.disabledDates || new Set(),
      disabledDateFn: initial.disabledDateFn || null,
      format: initial.format || 'YYYY-MM-DD',
      inline: initial.inline || false,
      placeholder: initial.placeholder || 'Select date',
      zIndex: initial.zIndex || 1000,
    };
  }

  getState(): DatePickerState {
    return { ...this.state };
  }

  setState(partial: Partial<DatePickerState>): void {
    this.state = { ...this.state, ...partial };
  }

  setViewDate(date: Date): void {
    this.state.viewDate = date;
    this.state.viewMonth = date.getMonth();
    this.state.viewYear = date.getFullYear();
  }

  setSelectedDates(dates: Date[]): void {
    this.state.selectedDates = dates;
  }

  setMode(mode: DateMode): void {
    this.state.mode = mode;
  }

  setCalendar(calendar: CalendarType): void {
    this.state.calendar = calendar;
  }

  setIsOpen(open: boolean): void {
    this.state.isOpen = open;
  }

  setTheme(theme: Theme): void {
    this.state.theme = theme;
  }

  setLocale(locale: string): void {
    this.state.locale = locale;
  }

  setFirstDayOfWeek(day: number): void {
    this.state.firstDayOfWeek = day;
  }

  setMinDate(date: Date | null): void {
    this.state.minDate = date;
  }

  setMaxDate(date: Date | null): void {
    this.state.maxDate = date;
  }

  setDisabledDates(dates: Set<string>, fn: ((d: Date) => boolean) | null): void {
    this.state.disabledDates = dates;
    this.state.disabledDateFn = fn;
  }

  setFormat(format: string): void {
    this.state.format = format;
  }

  setShowTime(show: boolean): void {
    this.state.showTime = show;
  }

  setTimeFormat(format: '12h' | '24h'): void {
    this.state.timeFormat = format;
  }

  setInline(inline: boolean): void {
    this.state.inline = inline;
  }

  setPlaceholder(placeholder: string): void {
    this.state.placeholder = placeholder;
  }

  setZIndex(z: number): void {
    this.state.zIndex = z;
  }
}