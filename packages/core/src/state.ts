import type {
  DateMode,
  CalendarType,
  Theme,
  Design,
  Layout,
  TimeFormat,
  NumeralSystem,
  HijriPreset,
  FirstDayOfWeek,
} from './types';
import { SmartDate } from './SmartDate';

export interface DatePickerState {
  viewDate: Date;
  viewYear: number;
  viewMonth: number; // 0-indexed in the current active calendar
  selectedDates: Date[];
  selectedSmartDates: SmartDate[];
  mode: DateMode;
  calendar: CalendarType;
  calendarSwitcher: boolean;
  isOpen: boolean;
  showTime: boolean;
  timeFormat: TimeFormat;
  hour: number;
  minute: number;
  second: number;
  theme: Theme;
  design: Design;
  layout: Layout;
  monthsCount?: number;
  firstDayOfWeek: FirstDayOfWeek;
  locale: string;
  minDate: Date | null;
  maxDate: Date | null;
  minSmartDate: SmartDate | null;
  maxSmartDate: SmartDate | null;
  disabledDates: Set<string>;
  disabledDateFn: ((d: Date | SmartDate) => boolean) | null;
  disabledWeekdays: number[];
  format: string;
  pattern: string;
  inline: boolean;
  placeholder: string;
  zIndex: number;
  hijriAdjustment: number;
  hijriPreset: HijriPreset;
  numeralSystem: NumeralSystem;
}

export class StateManager {
  private state: DatePickerState;

  constructor(initial: Partial<DatePickerState> = {}) {
    const now = new Date();
    const smartNow = new SmartDate(now);
    const cal = initial.calendar || 'gregorian';

    let initialYear = now.getFullYear();
    let initialMonth = now.getMonth();

    if (cal === 'jalali') {
      initialYear = smartNow.getShYear();
      initialMonth = smartNow.getShMonth() - 1;
    } else if (cal === 'hijri') {
      initialYear = smartNow.getHjYear();
      initialMonth = smartNow.getHjMonth() - 1;
    }

    this.state = {
      viewDate: initial.viewDate || now,
      viewYear: initial.viewYear ?? initialYear,
      viewMonth: initial.viewMonth ?? initialMonth,
      selectedDates: initial.selectedDates || [],
      selectedSmartDates: initial.selectedSmartDates || [],
      mode: initial.mode || 'single',
      calendar: cal,
      calendarSwitcher: initial.calendarSwitcher || false,
      isOpen: initial.isOpen || false,
      showTime: initial.showTime || false,
      timeFormat: initial.timeFormat || '24h',
      hour: initial.hour ?? now.getHours(),
      minute: initial.minute ?? now.getMinutes(),
      second: initial.second ?? 0,
      theme: initial.theme || 'light',
      design: initial.design || 'default',
      layout: initial.layout || 'popup',
      monthsCount: initial.monthsCount || 2,
      firstDayOfWeek: initial.firstDayOfWeek ?? (cal === 'jalali' ? 6 : cal === 'hijri' ? 6 : 0),
      locale: initial.locale || (cal === 'jalali' ? 'fa-IR' : cal === 'hijri' ? 'ar-SA' : 'en-US'),
      minDate: initial.minDate || null,
      maxDate: initial.maxDate || null,
      minSmartDate: initial.minSmartDate || null,
      maxSmartDate: initial.maxSmartDate || null,
      disabledDates: initial.disabledDates || new Set(),
      disabledDateFn: initial.disabledDateFn || null,
      disabledWeekdays: initial.disabledWeekdays || [],
      format: initial.format || 'YYYY-MM-DD',
      pattern: initial.pattern || (cal === 'jalali' ? 'Y/m/d' : cal === 'hijri' ? 'Y/m/d' : 'Y-m-d'),
      inline: initial.inline || false,
      placeholder: initial.placeholder || 'Select date',
      zIndex: initial.zIndex || 1000,
      hijriAdjustment: initial.hijriAdjustment || 0,
      hijriPreset: initial.hijriPreset || 'tabular',
      numeralSystem: initial.numeralSystem || (cal === 'jalali' ? 'arabext' : 'latn'),
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
    const smart = new SmartDate(date, this.state.hijriAdjustment, this.state.hijriPreset);
    if (this.state.calendar === 'jalali') {
      this.state.viewYear = smart.getShYear();
      this.state.viewMonth = smart.getShMonth() - 1;
    } else if (this.state.calendar === 'hijri') {
      this.state.viewYear = smart.getHjYear();
      this.state.viewMonth = smart.getHjMonth() - 1;
    } else {
      this.state.viewYear = date.getFullYear();
      this.state.viewMonth = date.getMonth();
    }
  }

  setViewYearMonth(year: number, month: number): void {
    this.state.viewYear = year;
    this.state.viewMonth = month;
  }

  setSelectedDates(dates: Date[]): void {
    this.state.selectedDates = dates;
    this.state.selectedSmartDates = dates.map(
      (d) => new SmartDate(d, this.state.hijriAdjustment, this.state.hijriPreset)
    );
  }

  setSelectedSmartDates(smartDates: SmartDate[]): void {
    this.state.selectedSmartDates = smartDates;
    this.state.selectedDates = smartDates.map((s) => s.toDate());
  }

  setMode(mode: DateMode): void {
    this.state.mode = mode;
  }

  setCalendar(calendar: CalendarType): void {
    this.state.calendar = calendar;
    const refDate =
      this.state.selectedDates.length > 0 ? this.state.selectedDates[0] : this.state.viewDate;
    const smart = new SmartDate(refDate, this.state.hijriAdjustment, this.state.hijriPreset);
    if (calendar === 'jalali') {
      this.state.viewYear = smart.getShYear();
      this.state.viewMonth = smart.getShMonth() - 1;
    } else if (calendar === 'hijri') {
      this.state.viewYear = smart.getHjYear();
      this.state.viewMonth = smart.getHjMonth() - 1;
    } else {
      this.state.viewYear = smart.getGrgYear();
      this.state.viewMonth = smart.getGrgMonth() - 1;
    }
  }

  setIsOpen(open: boolean): void {
    this.state.isOpen = open;
  }

  setTheme(theme: Theme): void {
    this.state.theme = theme;
  }

  setDesign(design: Design): void {
    this.state.design = design;
  }

  setLayout(layout: Layout): void {
    this.state.layout = layout;
  }

  setLocale(locale: string): void {
    this.state.locale = locale;
  }

  setFirstDayOfWeek(day: FirstDayOfWeek): void {
    this.state.firstDayOfWeek = day;
  }

  setMinDate(date: Date | null): void {
    this.state.minDate = date;
    this.state.minSmartDate = date
      ? new SmartDate(date, this.state.hijriAdjustment, this.state.hijriPreset)
      : null;
  }

  setMaxDate(date: Date | null): void {
    this.state.maxDate = date;
    this.state.maxSmartDate = date
      ? new SmartDate(date, this.state.hijriAdjustment, this.state.hijriPreset)
      : null;
  }

  setDisabledDates(
    dates: Set<string>,
    fn: ((d: Date | SmartDate) => boolean) | null,
    weekdays: number[] = []
  ): void {
    this.state.disabledDates = dates;
    this.state.disabledDateFn = fn;
    this.state.disabledWeekdays = weekdays;
  }

  setFormat(format: string): void {
    this.state.format = format;
  }

  setPattern(pattern: string): void {
    this.state.pattern = pattern;
  }

  setShowTime(show: boolean): void {
    this.state.showTime = show;
  }

  setTimeFormat(format: TimeFormat): void {
    this.state.timeFormat = format;
  }

  setTime(hour: number, minute: number, second = 0): void {
    this.state.hour = hour;
    this.state.minute = minute;
    this.state.second = second;
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

  setNumeralSystem(numeral: NumeralSystem): void {
    this.state.numeralSystem = numeral;
  }
}
