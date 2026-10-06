import type {
  DatePickerOptions,
  DatePickerInstance,
  CalendarCell,
  CalendarType,
  LocaleConfig,
} from './types';
import { EventEmitter } from './events';
import { StateManager } from './state';
import { getLocale, mergeLocale } from './i18n';
import { SmartDate } from './SmartDate';
import { SmartDateFormat } from './SmartDateFormat';
import {
  generateMonthDays,
  getDaysInMonth,
  isSameDay,
  isToday,
} from './engine';
import {
  createCalendarCellElement,
  createWeekdayHeaders,
  createCalendarSwitcher,
  createTimePicker,
  createOverlay,
  createPopup,
  applyTheme,
  applyDesign,
  applyLayout,
  applyDirection,
} from './dom';

export class DatePicker implements DatePickerInstance {
  private options: Partial<DatePickerOptions>;
  private state: StateManager;
  private events: EventEmitter;
  private container: HTMLElement | null = null;
  private inputEl: HTMLInputElement | null = null;
  private popup: HTMLElement | null = null;
  private overlay: HTMLElement | null = null;
  private destroyed = false;

  constructor(el: HTMLElement | string, options: Partial<DatePickerOptions> = {}) {
    this.options = { ...options };
    this.events = new EventEmitter();
    this.state = new StateManager();

    this.initContainer(el);
    this.initOptions();
    this.initLocale();
    this.render();
    this.attachEvents();

    const isInline = this.state.getState().inline || this.state.getState().layout === 'inline';
    if (!isInline) {
      this.inputEl?.addEventListener('click', () => this.toggle());
      this.inputEl?.addEventListener('focus', () => this.open());
    } else {
      this.open();
    }
  }

  private initContainer(el: HTMLElement | string): void {
    if (typeof el === 'string') {
      const element = document.querySelector(el);
      if (!element) {
        throw new Error(`Element not found: ${el}`);
      }
      this.container = element as HTMLElement;
    } else {
      this.container = el;
    }
  }

  private initOptions(): void {
    const opts = this.options;

    if (opts.mode) this.state.setMode(opts.mode);
    if (opts.calendar) this.state.setCalendar(opts.calendar);
    if (opts.calendarSwitcher !== undefined) this.state.setState({ calendarSwitcher: opts.calendarSwitcher });
    if (opts.showTime !== undefined) this.state.setShowTime(opts.showTime);
    if (opts.timeFormat) this.state.setTimeFormat(opts.timeFormat);
    if (opts.theme) this.state.setTheme(opts.theme);
    if (opts.design) this.state.setDesign(opts.design);
    if (opts.layout) this.state.setLayout(opts.layout);
    if (opts.inline !== undefined) {
      this.state.setInline(opts.inline);
      if (opts.inline) this.state.setLayout('inline');
    }
    if (opts.placeholder) this.state.setPlaceholder(opts.placeholder);
    if (opts.zIndex) this.state.setZIndex(opts.zIndex);
    if (opts.format) this.state.setFormat(opts.format);
    if (opts.pattern) this.state.setPattern(opts.pattern);
    if (opts.firstDayOfWeek !== undefined) {
      this.state.setFirstDayOfWeek(opts.firstDayOfWeek);
    }
    if (opts.hijriAdjustment !== undefined) {
      this.state.setState({ hijriAdjustment: opts.hijriAdjustment });
    }
    if (opts.hijriPreset) {
      this.state.setState({ hijriPreset: opts.hijriPreset });
    }
    if (opts.numeralSystem) {
      this.state.setNumeralSystem(opts.numeralSystem);
    }

    if (opts.value) {
      this.setValueInternal(opts.value);
    }

    if (opts.minDate) {
      const d = this.parseDate(opts.minDate);
      if (d) this.state.setMinDate(d.toDate());
    }
    if (opts.maxDate) {
      const d = this.parseDate(opts.maxDate);
      if (d) this.state.setMaxDate(d.toDate());
    }

    const disabledDates = new Set<string>();
    let disabledDateFn: ((d: any) => boolean) | null = null;
    if (Array.isArray(opts.disabledDates)) {
      opts.disabledDates.forEach((d) => {
        if (typeof d === 'string') disabledDates.add(d);
        else if (d instanceof SmartDate) disabledDates.add(d.format('Y-m-d'));
        else if (d instanceof Date) disabledDates.add(new SmartDate(d).format('Y-m-d'));
      });
    } else if (typeof opts.disabledDates === 'function') {
      disabledDateFn = opts.disabledDates;
    }
    this.state.setDisabledDates(disabledDates, disabledDateFn, opts.disabledWeekdays || []);
  }

  private initLocale(): void {
    const opts = this.options;
    const defaultLocale =
      opts.calendar === 'jalali' ? 'fa-IR' : opts.calendar === 'hijri' ? 'ar-SA' : 'en-US';
    const loc = opts.locale || defaultLocale;
    this.state.setLocale(typeof loc === 'string' ? loc : loc.code || defaultLocale);
  }

  private getLocaleConfig(): LocaleConfig {
    const s = this.state.getState();
    const localeOpt = this.options.locale;
    const base = getLocale(s.locale);
    if (typeof localeOpt === 'object') {
      return mergeLocale(base, localeOpt);
    }
    return base;
  }

  private setValueInternal(v: any): void {
    if (!v) {
      this.state.setSelectedDates([]);
      return;
    }

    const parseToSmart = (item: any): SmartDate | null => {
      if (item instanceof SmartDate) return item;
      if (item instanceof Date) return new SmartDate(item);
      if (typeof item === 'string') return this.parseDate(item);
      return null;
    };

    if (Array.isArray(v)) {
      const parsed = v.map(parseToSmart).filter((d): d is SmartDate => d !== null);
      if (parsed.length > 0) {
        this.state.setSelectedSmartDates(parsed);
        this.state.setViewDate(parsed[0].toDate());
      }
    } else {
      const single = parseToSmart(v);
      if (single) {
        this.state.setSelectedSmartDates([single]);
        this.state.setViewDate(single.toDate());
      }
    }
  }

  render(): void {
    if (!this.container || this.destroyed) return;

    this.container.innerHTML = '';

    const s = this.state.getState();
    const locale = this.getLocaleConfig();
    const isInline = s.inline || s.layout === 'inline';

    if (!isInline) {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'dp-input';
      input.placeholder = s.placeholder;
      input.readOnly = true;

      const formattedVal = this.getValue();
      if (formattedVal) {
        input.value = Array.isArray(formattedVal) ? formattedVal.join(', ') : formattedVal;
      }

      this.inputEl = input;
      this.container.appendChild(input);
    }

    if (isInline) {
      const wrapper = document.createElement('div');
      wrapper.className = 'dp-inline';
      this.container.appendChild(wrapper);
    }

    if (!isInline) {
      this.overlay = createOverlay(this.container);
      this.container.appendChild(this.overlay);
    }

    this.popup = createPopup(this.container, s.zIndex);
    applyTheme(this.popup, s.theme);
    applyDesign(this.popup, s.design);
    applyLayout(this.popup, s.layout);
    applyDirection(this.popup, locale.direction);

    this.renderCalendar();

    if (isInline) {
      this.state.setIsOpen(true);
      this.events.emit('open', {});
    }
  }

  renderCalendar(): void {
    if (!this.popup) return;

    const s = this.state.getState();
    const locale = this.getLocaleConfig();
    this.popup.innerHTML = '';

    // Calendar switcher (if enabled)
    if (s.calendarSwitcher) {
      const switcher = createCalendarSwitcher(s.calendar, (newCal) => {
        this.switchCalendar(newCal);
      });
      this.popup.appendChild(switcher);
    }

    const monthsToRender = s.layout === 'multi-month' ? (s.monthsCount || 2) : 1;
    const monthsWrapper = document.createElement('div');
    monthsWrapper.className = monthsToRender > 1 ? 'dp-multi-month-container' : 'dp-single-month-container';

    for (let mOffset = 0; mOffset < monthsToRender; mOffset++) {
      let activeMonth = s.viewMonth + mOffset;
      let activeYear = s.viewYear;

      while (activeMonth > 11) {
        activeMonth -= 12;
        activeYear++;
      }

      const monthSection = document.createElement('div');
      monthSection.className = 'dp-month-pane';

      // Header
      const header = document.createElement('div');
      header.className = 'dp-header';

      const prevBtn = document.createElement('button');
      prevBtn.type = 'button';
      prevBtn.className = 'dp-nav-btn dp-nav-prev';
      prevBtn.innerHTML = locale.direction === 'rtl' ? '&gt;' : '&lt;';
      prevBtn.setAttribute('aria-label', locale.navPrev || 'Previous Month');
      prevBtn.addEventListener('click', () => this.navigateMonth(-1));

      const monthYearTitle = document.createElement('div');
      monthYearTitle.className = 'dp-month-year';

      // Resolve month name in current active calendar
      const monthNames = locale.months;
      const monthDisplay = monthNames[activeMonth + 1] || monthNames[activeMonth] || `Month ${activeMonth + 1}`;
      monthYearTitle.textContent = `${monthDisplay} ${activeYear}`;

      const nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.className = 'dp-nav-btn dp-nav-next';
      nextBtn.innerHTML = locale.direction === 'rtl' ? '&lt;' : '&gt;';
      nextBtn.setAttribute('aria-label', locale.navNext || 'Next Month');
      nextBtn.addEventListener('click', () => this.navigateMonth(1));

      if (mOffset === 0) header.appendChild(prevBtn);
      else {
        const dummy = document.createElement('span');
        dummy.style.width = '24px';
        header.appendChild(dummy);
      }

      header.appendChild(monthYearTitle);

      if (mOffset === monthsToRender - 1) header.appendChild(nextBtn);
      else {
        const dummy = document.createElement('span');
        dummy.style.width = '24px';
        header.appendChild(dummy);
      }

      monthSection.appendChild(header);

      // Weekday headers
      const weekdayHeaders = createWeekdayHeaders(locale);
      const weekdayRow = document.createElement('div');
      weekdayRow.className = 'dp-weekdays';
      weekdayHeaders.forEach((h) => weekdayRow.appendChild(h));
      monthSection.appendChild(weekdayRow);

      // Grid days
      const cells = generateMonthDays(
        activeYear,
        activeMonth,
        s.selectedDates,
        s.minDate,
        s.maxDate,
        s.disabledDates,
        s.disabledDateFn,
        s.locale,
        s.calendar,
        s.disabledWeekdays,
        s.mode
      );

      const grid = document.createElement('div');
      grid.className = 'dp-grid';
      grid.setAttribute('role', 'grid');

      cells.forEach((cell) => {
        const btn = createCalendarCellElement(cell, locale, s.numeralSystem);
        btn.addEventListener('click', () => this.selectDate(cell.date, cell.isDisabled));
        grid.appendChild(btn);
      });

      monthSection.appendChild(grid);
      monthsWrapper.appendChild(monthSection);
    }

    this.popup.appendChild(monthsWrapper);

    // Time picker
    if (s.showTime) {
      const timePicker = createTimePicker(s.hour, s.minute, s.timeFormat, (h, m) => {
        this.state.setTime(h, m);
        if (s.selectedSmartDates.length > 0) {
          s.selectedSmartDates[0].setHour(h).setMinute(m);
          this.state.setSelectedSmartDates([...s.selectedSmartDates]);
        }
        this.updateInput();
        this.events.emit('change', { value: this.getValue(), smartDate: this.getSmartDate() });
      });
      this.popup.appendChild(timePicker);
    }

    // Footer actions
    const footer = document.createElement('div');
    footer.className = 'dp-footer';

    const todayBtn = document.createElement('button');
    todayBtn.type = 'button';
    todayBtn.className = 'dp-btn dp-btn-today';
    todayBtn.textContent = locale.today;
    todayBtn.addEventListener('click', () => this.goToToday());

    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'dp-btn dp-btn-clear';
    clearBtn.textContent = locale.clear;
    clearBtn.addEventListener('click', () => this.clear());

    footer.appendChild(todayBtn);
    footer.appendChild(clearBtn);
    this.popup.appendChild(footer);
  }

  private selectDate(date: Date, isDisabled: boolean): void {
    if (isDisabled) {
      this.events.emit('error', { message: 'Date is disabled' });
      return;
    }

    const s = this.state.getState();
    const smart = new SmartDate(date, s.hijriAdjustment, s.hijriPreset);
    if (s.showTime) {
      smart.setHour(s.hour).setMinute(s.minute).setSecond(s.second);
    }

    let selected = [...s.selectedDates];
    let selectedSmarts = [...s.selectedSmartDates];

    if (s.mode === 'single') {
      selected = [smart.toDate()];
      selectedSmarts = [smart];
    } else if (s.mode === 'multiple') {
      const idx = selected.findIndex((d) => isSameDay(d, date));
      if (idx >= 0) {
        selected.splice(idx, 1);
        selectedSmarts.splice(idx, 1);
      } else {
        selected.push(smart.toDate());
        selectedSmarts.push(smart);
      }
    } else if (s.mode === 'range') {
      if (selected.length === 0 || selected.length === 2) {
        selected = [smart.toDate()];
        selectedSmarts = [smart];
      } else if (selected.length === 1) {
        const start = selected[0] < smart.toDate() ? selected[0] : smart.toDate();
        const end = selected[0] < smart.toDate() ? smart.toDate() : selected[0];
        selected = [start, end];
        selectedSmarts = [
          new SmartDate(start, s.hijriAdjustment, s.hijriPreset),
          new SmartDate(end, s.hijriAdjustment, s.hijriPreset),
        ];
      }
    }

    this.state.setSelectedDates(selected);
    this.state.setSelectedSmartDates(selectedSmarts);
    this.renderCalendar();
    this.updateInput();

    const isInline = s.inline || s.layout === 'inline';

    if (s.mode === 'single' || (s.mode === 'range' && selected.length === 2)) {
      this.events.emit('select', { date: smart.toDate(), smartDate: smart, value: this.getValue() });
      this.events.emit('change', { value: this.getValue(), smartDate: this.getSmartDate() });
      if (!isInline) {
        this.close();
      }
    } else if (s.mode === 'multiple') {
      this.events.emit('select', { date: smart.toDate(), smartDate: smart, value: this.getValue() });
      this.events.emit('change', { value: this.getValue(), smartDate: this.getSmartDate() });
    }
  }

  private updateInput(): void {
    if (!this.inputEl) return;
    const val = this.getValue();
    if (val) {
      this.inputEl.value = Array.isArray(val) ? val.join(', ') : val;
    } else {
      this.inputEl.value = '';
    }
  }

  navigateMonth(delta: number): void {
    const s = this.state.getState();
    let month = s.viewMonth + delta;
    let year = s.viewYear;

    while (month > 11) {
      month -= 12;
      year++;
    }
    while (month < 0) {
      month += 12;
      year--;
    }

    this.state.setViewYearMonth(year, month);
    this.renderCalendar();
    this.events.emit('navigate', { year, month, calendar: s.calendar });
  }

  goToToday(): void {
    const now = new Date();
    this.state.setViewDate(now);
    this.renderCalendar();
  }

  switchCalendar(newCal: CalendarType): void {
    this.state.setCalendar(newCal);

    // Sync default locale and numeral system for the chosen calendar
    if (newCal === 'jalali') {
      this.state.setLocale('fa-IR');
      this.state.setNumeralSystem('arabext');
      this.state.setFirstDayOfWeek(6);
    } else if (newCal === 'hijri') {
      this.state.setLocale('ar-SA');
      this.state.setNumeralSystem('arab');
      this.state.setFirstDayOfWeek(6);
    } else {
      this.state.setLocale('en-US');
      this.state.setNumeralSystem('latn');
      this.state.setFirstDayOfWeek(0);
    }

    this.render();
    this.events.emit('calendar-change', { calendar: newCal });
    this.events.emit('change', { value: this.getValue(), smartDate: this.getSmartDate() });
  }

  private attachEvents(): void {
    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.close());
    }

    document.addEventListener('keydown', (e) => {
      if (this.destroyed || !this.state.getState().isOpen) return;
      if (e.key === 'Escape') {
        this.close();
      }
    });
  }

  open(): void {
    if (this.destroyed || this.state.getState().isOpen) return;
    this.state.setIsOpen(true);
    if (this.popup) this.popup.style.display = 'block';
    if (this.overlay) this.overlay.style.display = 'block';
    this.events.emit('open', {});
  }

  close(): void {
    if (this.destroyed || !this.state.getState().isOpen) return;
    this.state.setIsOpen(false);
    if (this.popup) this.popup.style.display = 'none';
    if (this.overlay) this.overlay.style.display = 'none';
    this.events.emit('close', {});
  }

  toggle(): void {
    if (this.state.getState().isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.close();
    this.events.destroy();
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  getValue(): string | string[] | null {
    const s = this.state.getState();
    if (s.selectedSmartDates.length === 0) return null;

    const pattern = s.pattern || s.format || (s.calendar === 'jalali' ? 'Y/m/d' : 'Y-m-d');

    if (s.mode === 'single') {
      return this.formatDate(s.selectedSmartDates[0], pattern, s.calendar);
    }

    return s.selectedSmartDates.map((d) => this.formatDate(d, pattern, s.calendar));
  }

  getSmartDate(): SmartDate | SmartDate[] | { start: SmartDate; end: SmartDate } | null {
    const s = this.state.getState();
    if (s.selectedSmartDates.length === 0) return null;

    if (s.mode === 'single') {
      return s.selectedSmartDates[0];
    }

    if (s.mode === 'range') {
      if (s.selectedSmartDates.length >= 2) {
        return { start: s.selectedSmartDates[0], end: s.selectedSmartDates[1] };
      }
      return s.selectedSmartDates[0];
    }

    return s.selectedSmartDates;
  }

  setValue(v: string | string[] | Date | Date[] | SmartDate | SmartDate[]): void {
    this.setValueInternal(v);
    this.renderCalendar();
    this.updateInput();
    this.events.emit('change', { value: this.getValue(), smartDate: this.getSmartDate() });
  }

  clear(): void {
    this.state.setSelectedDates([]);
    this.state.setSelectedSmartDates([]);
    this.renderCalendar();
    this.updateInput();
    this.events.emit('clear', {});
    this.events.emit('change', { value: null, smartDate: null });
  }

  setLocale(l: string): void {
    this.state.setLocale(l);
    this.render();
  }

  formatDate(d: SmartDate | Date, pattern?: string, calendar?: CalendarType): string {
    const s = this.state.getState();
    const cal = calendar || s.calendar;
    const pat = pattern || s.pattern || s.format || 'Y/m/d';
    const smart = d instanceof SmartDate ? d : new SmartDate(d);
    return smart.format(pat, cal);
  }

  parseDate(s: string, pattern?: string, calendar?: CalendarType): SmartDate | null {
    const st = this.state.getState();
    const cal = calendar || st.calendar;
    const pat = pattern || st.pattern;
    try {
      return SmartDateFormat.parse(s, pat, cal);
    } catch {
      return null;
    }
  }

  on(event: string, cb: (payload: any) => void): () => void {
    return this.events.on(event, cb);
  }

  update(options: Partial<DatePickerOptions>): void {
    this.options = { ...this.options, ...options };
    this.initOptions();
    this.initLocale();
    this.render();
    this.events.emit('change', { value: this.getValue(), smartDate: this.getSmartDate() });
  }
}
