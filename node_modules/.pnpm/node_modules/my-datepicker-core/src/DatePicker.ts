import type { DatePickerOptions, DatePickerInstance, CalendarCell } from './types';
import { EventEmitter } from './events';
import { StateManager } from './state';
import { getLocale, mergeLocale } from './i18n';
import {
  generateMonthDays,
  getDaysInMonth,
  getWeekdayNames,
  formatDate,
  parseDate,
  isSameDay,
  isToday,
} from './engine';
import {
  createCalendarCellElement,
  createWeekdayHeaders,
  createOverlay,
  createPopup,
  applyTheme,
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
  private localeConfig: any = null;

  constructor(el: HTMLElement | string, options: Partial<DatePickerOptions> = {}) {
    this.options = options;
    this.events = new EventEmitter();
    this.state = new StateManager();

    this.initContainer(el);
    this.initOptions();
    this.initLocale();
    this.render();
    this.attachEvents();

    if (!this.state.getState().inline) {
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
    const s = this.state.getState();
    const opts = this.options;

    if (opts.mode) this.state.setMode(opts.mode);
    if (opts.calendar) this.state.setCalendar(opts.calendar);
    if (opts.showTime !== undefined) this.state.setShowTime(opts.showTime);
    if (opts.timeFormat) this.state.setTimeFormat(opts.timeFormat);
    if (opts.theme) this.state.setTheme(opts.theme);
    if (opts.inline !== undefined) this.state.setInline(opts.inline);
    if (opts.placeholder) this.state.setPlaceholder(opts.placeholder);
    if (opts.zIndex) this.state.setZIndex(opts.zIndex);
    if (opts.format) this.state.setFormat(opts.format);
    if (opts.firstDayOfWeek !== undefined) {
      this.state.setFirstDayOfWeek(opts.firstDayOfWeek);
    }

    if (opts.value) {
      const dates = parseDate(opts.value);
      if (dates.length > 0) {
        this.state.setSelectedDates(dates);
        this.state.setViewDate(dates[0]);
      }
    }

    if (opts.minDate) {
      const d = parseDate(opts.minDate);
      if (d.length > 0) this.state.setMinDate(d[0]);
    }
    if (opts.maxDate) {
      const d = parseDate(opts.maxDate);
      if (d.length > 0) this.state.setMaxDate(d[0]);
    }

    let disabledDates = new Set<string>();
    let disabledDateFn: ((d: Date) => boolean) | null = null;
    if (Array.isArray(opts.disabledDates)) {
      opts.disabledDates.forEach((d) => disabledDates.add(d));
    } else if (typeof opts.disabledDates === 'function') {
      disabledDateFn = opts.disabledDates;
    }
    this.state.setDisabledDates(disabledDates, disabledDateFn);
  }

  private initLocale(): void {
    const opts = this.options;
    const locale = opts.locale || 'en-US';
    this.state.setLocale(typeof locale === 'string' ? locale : locale.code || 'en-US');
  }

  private getLocaleConfig(): any {
    const s = this.state.getState();
    const localeOpt = this.options.locale;
    const base = getLocale(s.locale);
    if (typeof localeOpt === 'object') {
      return mergeLocale(base, localeOpt);
    }
    return base;
  }

  render(): void {
    if (!this.container || this.destroyed) return;

    this.container.innerHTML = '';

    const s = this.state.getState();
    const locale = this.getLocaleConfig();

    if (!s.inline) {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'dp-input';
      input.placeholder = s.placeholder;
      input.readOnly = true;

      const values = s.selectedDates;
      if (values.length > 0) {
        input.value = values.map((d) => formatDate(d, s.format)).join(', ');
      }

      this.inputEl = input;
      this.container.appendChild(input);
    }

    if (s.inline) {
      const wrapper = document.createElement('div');
      wrapper.className = 'dp-inline';
      this.container.appendChild(wrapper);
    }

    if (!s.inline) {
      this.overlay = createOverlay(this.container);
      this.container.appendChild(this.overlay);
    }

    this.popup = createPopup(this.container, s.zIndex);
    applyTheme(this.popup, s.theme);
    applyDirection(this.popup, locale.direction);

    this.renderCalendar();

    if (s.inline) {
      this.state.setIsOpen(true);
      this.events.emit('open', {});
    }
  }

  renderCalendar(): void {
    if (!this.popup) return;

    const s = this.state.getState();
    const locale = this.getLocaleConfig();
    const daysInMonth = getDaysInMonth(s.viewYear, s.viewMonth);
    const cells = generateMonthDays(
      s.viewYear,
      s.viewMonth,
      s.selectedDates,
      s.minDate,
      s.maxDate,
      s.disabledDates,
      s.disabledDateFn,
      s.locale,
      s.calendar
    );

    this.popup.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'dp-header';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'dp-nav-btn';
    prevBtn.innerHTML = '&lt;';
    prevBtn.addEventListener('click', () => this.navigateMonth(-1));

    const monthYear = document.createElement('div');
    monthYear.className = 'dp-month-year';
    monthYear.textContent = `${locale.months[s.viewMonth]} ${s.viewYear}`;

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'dp-nav-btn';
    nextBtn.innerHTML = '&gt;';
    nextBtn.addEventListener('click', () => this.navigateMonth(1));

    header.appendChild(prevBtn);
    header.appendChild(monthYear);
    header.appendChild(nextBtn);
    this.popup.appendChild(header);

    const weekdayHeaders = createWeekdayHeaders(locale);
    const weekdayRow = document.createElement('div');
    weekdayRow.className = 'dp-weekdays';
    weekdayHeaders.forEach((h) => weekdayRow.appendChild(h));
    this.popup.appendChild(weekdayRow);

    const grid = document.createElement('div');
    grid.className = 'dp-grid';
    cells.forEach((cell) => {
      const btn = createCalendarCellElement(cell, locale);
      btn.addEventListener('click', () => this.selectDate(cell.date, cell.isDisabled));
      grid.appendChild(btn);
    });
    this.popup.appendChild(grid);

    const footer = document.createElement('div');
    footer.className = 'dp-footer';

    const todayBtn = document.createElement('button');
    todayBtn.type = 'button';
    todayBtn.className = 'dp-btn';
    todayBtn.textContent = locale.today;
    todayBtn.addEventListener('click', () => this.goToToday());

    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'dp-btn';
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
    let selected = [...s.selectedDates];

    if (s.mode === 'single') {
      selected = [date];
    } else if (s.mode === 'multiple') {
      const idx = selected.findIndex((d) => isSameDay(d, date));
      if (idx >= 0) {
        selected.splice(idx, 1);
      } else {
        selected.push(date);
      }
    } else if (s.mode === 'range') {
      if (selected.length === 0) {
        selected = [date];
      } else if (selected.length === 1) {
        const start = selected[0];
        const end = date;
        selected = [start, end];
      } else if (selected.length === 2) {
        selected = [date];
      }
    }

    this.state.setSelectedDates(selected);
    this.renderCalendar();
    this.updateInput();

    if (s.mode === 'single' || (s.mode === 'range' && selected.length === 2)) {
      this.events.emit('select', { date, value: this.getValue() });
      this.events.emit('change', { value: this.getValue() });
      if (!s.inline) {
        this.close();
      }
    }
  }

  private updateInput(): void {
    if (!this.inputEl) return;
    const s = this.state.getState();
    const values = s.selectedDates;
    if (values.length > 0) {
      this.inputEl.value = values.map((d) => formatDate(d, s.format)).join(', ');
    } else {
      this.inputEl.value = '';
    }
  }

  private navigateMonth(delta: number): void {
    const s = this.state.getState();
    let month = s.viewMonth + delta;
    let year = s.viewYear;

    if (month > 11) {
      month = 0;
      year++;
    } else if (month < 0) {
      month = 11;
      year--;
    }

    this.state.setViewDate(new Date(year, month, 1));
    this.renderCalendar();
    this.events.emit('navigate', { year, month });
  }

  private goToToday(): void {
    const today = new Date();
    this.state.setViewDate(today);
    this.renderCalendar();
  }

  navigateMonth(delta: number): void {
    const s = this.state.getState();
    let month = s.viewMonth + delta;
    let year = s.viewYear;

    if (month > 11) {
      month = 0;
      year++;
    } else if (month < 0) {
      month = 11;
      year--;
    }

    this.state.setViewDate(new Date(year, month, 1));
    this.renderCalendar();
    this.events.emit('navigate', { year, month });
  }

  goToToday(): void {
    const today = new Date();
    this.state.setViewDate(today);
    this.renderCalendar();
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
    if (s.selectedDates.length === 0) return null;

    if (s.mode === 'single') {
      return formatDate(s.selectedDates[0], s.format);
    }

    return s.selectedDates.map((d) => formatDate(d, s.format));
  }

  setValue(v: string | string[]): void {
    const dates = parseDate(v);
    if (dates.length > 0) {
      this.state.setSelectedDates(dates);
      this.state.setViewDate(dates[0]);
      this.renderCalendar();
      this.updateInput();
      this.events.emit('change', { value: this.getValue() });
    }
  }

  clear(): void {
    this.state.setSelectedDates([]);
    this.renderCalendar();
    this.updateInput();
    this.events.emit('clear', {});
  }

  setLocale(l: string): void {
    this.state.setLocale(l);
    this.renderCalendar();
  }

  on(event: string, cb: (payload: any) => void): () => void {
    return this.events.on(event, cb);
  }

  update(options: Partial<DatePickerOptions>): void {
    this.options = { ...this.options, ...options };
    this.initOptions();
    this.initLocale();
    this.render();
    this.events.emit('change', { value: this.getValue() });
  }
}