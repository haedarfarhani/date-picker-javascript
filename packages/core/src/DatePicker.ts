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
  toLocalDigits,
  CHEVRON_LEFT_SVG,
  CHEVRON_RIGHT_SVG,
  CALENDAR_ICON_SVG,
} from './dom';

export class DatePicker implements DatePickerInstance {
  private options: Partial<DatePickerOptions>;
  private state: StateManager;
  private events: EventEmitter;
  private container: HTMLElement | null = null;
  private inputEl: HTMLInputElement | null = null;
  private clearBtnEl: HTMLButtonElement | null = null;
  private popup: HTMLElement | null = null;
  private overlay: HTMLElement | null = null;
  private liveRegion: HTMLElement | null = null;
  private destroyed = false;

  // View Mode: 'days' | 'months' | 'years'
  private currentView: 'days' | 'months' | 'years' = 'days';
  private focusedCellIndex = 0;

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
    this.container.classList.add('dp-container');

    const s = this.state.getState();
    const locale = this.getLocaleConfig();
    const isInline = s.inline || s.layout === 'inline';

    if (!isInline) {
      const wrapper = document.createElement('div');
      wrapper.className = 'dp-input-wrapper';

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
      input.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });
      wrapper.appendChild(input);

      // Icon trigger
      const iconBtn = document.createElement('span');
      iconBtn.className = 'dp-input-icon';
      iconBtn.innerHTML = CALENDAR_ICON_SVG;
      iconBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });
      wrapper.appendChild(iconBtn);

      // Clear button (visible when value exists)
      const clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'dp-input-clear';
      clearBtn.innerHTML = '&times;';
      clearBtn.style.display = formattedVal ? 'flex' : 'none';
      clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.clear();
      });
      this.clearBtnEl = clearBtn;
      wrapper.appendChild(clearBtn);

      this.container.appendChild(wrapper);
    }

    if (isInline) {
      const wrapper = document.createElement('div');
      wrapper.className = 'dp-inline';
      this.container.appendChild(wrapper);
    }

    if (!isInline) {
      this.overlay = createOverlay(this.container);
      this.overlay.addEventListener('click', () => this.close());
      this.container.appendChild(this.overlay);
    }

    this.popup = createPopup(this.container, s.zIndex);
    applyTheme(this.popup, s.theme);
    applyDesign(this.popup, s.design);
    applyLayout(this.popup, s.layout);
    applyDirection(this.popup, locale.direction);

    // Live announcement region for a11y
    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.className = 'sr-only';
    this.liveRegion.style.position = 'absolute';
    this.liveRegion.style.width = '1px';
    this.liveRegion.style.height = '1px';
    this.liveRegion.style.overflow = 'hidden';
    this.popup.appendChild(this.liveRegion);

    this.renderCalendar();

    if (isInline) {
      this.state.setIsOpen(true);
      this.events.emit('open', {});
    } else if (s.isOpen) {
      this.popup.style.display = 'block';
      this.popup.classList.add('dp-open');
      if (this.overlay) {
        this.overlay.style.display = 'block';
        this.overlay.classList.add('dp-open');
      }
    }
  }

  renderCalendar(): void {
    if (!this.popup) return;

    const s = this.state.getState();
    const locale = this.getLocaleConfig();

    // Preserve live region and drag handle
    const dragHandle = this.popup.querySelector('.dp-drag-handle');
    this.popup.innerHTML = '';
    if (dragHandle) this.popup.appendChild(dragHandle);
    if (this.liveRegion) this.popup.appendChild(this.liveRegion);

    // Calendar Switcher
    if (s.calendarSwitcher) {
      const switcher = createCalendarSwitcher(s.calendar, (newCal) => {
        this.switchCalendar(newCal);
      });
      this.popup.appendChild(switcher);
    }

    // Branch based on current view: 'days' | 'months' | 'years'
    if (this.currentView === 'months') {
      this.renderMonthsView();
      return;
    }

    if (this.currentView === 'years') {
      this.renderYearsView();
      return;
    }

    // Standard Days View
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
      prevBtn.innerHTML = CHEVRON_LEFT_SVG;
      prevBtn.setAttribute('aria-label', locale.navPrev || 'Previous Month');
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.navigateMonth(-1);
      });

      // Interactive Month & Year Buttons
      const monthYearTitle = document.createElement('div');
      monthYearTitle.className = 'dp-month-year';

      const monthBtn = document.createElement('button');
      monthBtn.type = 'button';
      monthBtn.className = 'dp-title-btn dp-title-month';
      const monthNames = locale.months;
      const monthName = monthNames[activeMonth + 1] || monthNames[activeMonth] || `Month ${activeMonth + 1}`;
      monthBtn.textContent = monthName;
      monthBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.currentView = 'months';
        this.renderCalendar();
      });

      const yearBtn = document.createElement('button');
      yearBtn.type = 'button';
      yearBtn.className = 'dp-title-btn dp-title-year';
      yearBtn.textContent = toLocalDigits(activeYear, s.numeralSystem);
      yearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.currentView = 'years';
        this.renderCalendar();
      });

      monthYearTitle.appendChild(monthBtn);
      monthYearTitle.appendChild(yearBtn);

      const nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.className = 'dp-nav-btn dp-nav-next';
      nextBtn.innerHTML = CHEVRON_RIGHT_SVG;
      nextBtn.setAttribute('aria-label', locale.navNext || 'Next Month');
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.navigateMonth(1);
      });

      if (mOffset === 0) header.appendChild(prevBtn);
      else {
        const spacer = document.createElement('span');
        spacer.style.width = '32px';
        header.appendChild(spacer);
      }

      header.appendChild(monthYearTitle);

      if (mOffset === monthsToRender - 1) header.appendChild(nextBtn);
      else {
        const spacer = document.createElement('span');
        spacer.style.width = '32px';
        header.appendChild(spacer);
      }

      monthSection.appendChild(header);

      // Weekdays Row
      const weekdayHeaders = createWeekdayHeaders(locale);
      const weekdayRow = document.createElement('div');
      weekdayRow.className = 'dp-weekdays';
      weekdayHeaders.forEach((h) => weekdayRow.appendChild(h));
      monthSection.appendChild(weekdayRow);

      // Grid Cells
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

      cells.forEach((cell, idx) => {
        const btn = createCalendarCellElement(cell, locale, s.numeralSystem);
        btn.setAttribute('tabindex', cell.isSelected || (idx === 0 && !cell.isDisabled) ? '0' : '-1');
        btn.addEventListener('click', () => this.selectDate(cell.date, cell.isDisabled));
        grid.appendChild(btn);
      });

      monthSection.appendChild(grid);
      monthsWrapper.appendChild(monthSection);
    }

    this.popup.appendChild(monthsWrapper);

    // Announce current view for screen readers
    if (this.liveRegion) {
      const monthNames = locale.months;
      const mName = monthNames[s.viewMonth + 1] || monthNames[s.viewMonth];
      this.liveRegion.textContent = `${mName} ${s.viewYear}`;
    }

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

  // Month Selection Grid View
  private renderMonthsView(): void {
    if (!this.popup) return;
    const s = this.state.getState();
    const locale = this.getLocaleConfig();

    const header = document.createElement('div');
    header.className = 'dp-header';

    const backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.className = 'dp-nav-btn';
    backBtn.innerHTML = CHEVRON_LEFT_SVG;
    backBtn.addEventListener('click', () => {
      this.currentView = 'days';
      this.renderCalendar();
    });

    const title = document.createElement('span');
    title.className = 'dp-month-year';
    title.textContent = `انتخاب ماه (${toLocalDigits(s.viewYear, s.numeralSystem)})`;

    header.appendChild(backBtn);
    header.appendChild(title);
    this.popup.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'dp-view-grid';

    const months = locale.months.slice(1);
    months.forEach((mName, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dp-view-item';
      if (idx === s.viewMonth) {
        btn.classList.add('dp-view-item--selected');
      }
      btn.textContent = mName;
      btn.addEventListener('click', () => {
        this.state.setViewYearMonth(s.viewYear, idx);
        this.currentView = 'days';
        this.renderCalendar();
      });
      grid.appendChild(btn);
    });

    this.popup.appendChild(grid);
  }

  // Decade / Years Selection Grid View
  private renderYearsView(): void {
    if (!this.popup) return;
    const s = this.state.getState();

    const startYear = Math.floor(s.viewYear / 12) * 12;
    const endYear = startYear + 11;

    const header = document.createElement('div');
    header.className = 'dp-header';

    const prevDecadeBtn = document.createElement('button');
    prevDecadeBtn.type = 'button';
    prevDecadeBtn.className = 'dp-nav-btn';
    prevDecadeBtn.innerHTML = CHEVRON_LEFT_SVG;
    prevDecadeBtn.addEventListener('click', () => {
      this.state.setViewYearMonth(s.viewYear - 12, s.viewMonth);
      this.renderCalendar();
    });

    const title = document.createElement('span');
    title.className = 'dp-month-year';
    title.textContent = `${toLocalDigits(startYear, s.numeralSystem)} – ${toLocalDigits(endYear, s.numeralSystem)}`;

    const nextDecadeBtn = document.createElement('button');
    nextDecadeBtn.type = 'button';
    nextDecadeBtn.className = 'dp-nav-btn';
    nextDecadeBtn.innerHTML = CHEVRON_RIGHT_SVG;
    nextDecadeBtn.addEventListener('click', () => {
      this.state.setViewYearMonth(s.viewYear + 12, s.viewMonth);
      this.renderCalendar();
    });

    header.appendChild(prevDecadeBtn);
    header.appendChild(title);
    header.appendChild(nextDecadeBtn);
    this.popup.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'dp-view-grid';

    for (let y = startYear; y <= endYear; y++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dp-view-item';
      if (y === s.viewYear) {
        btn.classList.add('dp-view-item--selected');
      }
      btn.textContent = toLocalDigits(y, s.numeralSystem);
      btn.addEventListener('click', () => {
        this.state.setViewYearMonth(y, s.viewMonth);
        this.currentView = 'months';
        this.renderCalendar();
      });
      grid.appendChild(btn);
    }

    this.popup.appendChild(grid);
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
      if (this.clearBtnEl) this.clearBtnEl.style.display = 'flex';
    } else {
      this.inputEl.value = '';
      if (this.clearBtnEl) this.clearBtnEl.style.display = 'none';
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
    this.currentView = 'days';
    this.renderCalendar();
  }

  switchCalendar(newCal: CalendarType): void {
    const wasOpen = this.state.getState().isOpen;
    this.state.setCalendar(newCal);

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

    this.currentView = 'days';

    const locale = this.getLocaleConfig();
    if (this.popup) {
      applyDirection(this.popup, locale.direction);
    }
    if (this.inputEl) {
      this.inputEl.dir = locale.direction;
    }

    this.renderCalendar();
    this.updateInput();

    if (wasOpen && this.popup) {
      this.popup.style.display = 'block';
      this.popup.classList.add('dp-open');
      if (this.overlay) {
        this.overlay.style.display = 'block';
        this.overlay.classList.add('dp-open');
      }
    }

    this.events.emit('calendar-change', { calendar: newCal });
    if (this.state.getState().selectedSmartDates.length > 0) {
      this.events.emit('change', { value: this.getValue(), smartDate: this.getSmartDate() });
    }
  }

  // Keyboard navigation for WAI-ARIA
  private attachEvents(): void {
    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.close());
    }

    document.addEventListener('keydown', (e) => {
      if (this.destroyed || !this.state.getState().isOpen) return;

      if (e.key === 'Escape') {
        this.close();
        return;
      }

      if (this.currentView !== 'days' || !this.popup) return;

      const cells = Array.from(this.popup.querySelectorAll<HTMLButtonElement>('.dp-day'));
      if (cells.length === 0) return;

      const s = this.state.getState();
      const isRTL = s.locale.startsWith('fa') || s.locale.startsWith('ar');

      let currentFocusIndex = cells.findIndex((btn) => btn === document.activeElement);
      if (currentFocusIndex === -1) currentFocusIndex = 0;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const next = isRTL ? currentFocusIndex - 1 : currentFocusIndex + 1;
        if (next >= 0 && next < cells.length) cells[next].focus();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const next = isRTL ? currentFocusIndex + 1 : currentFocusIndex - 1;
        if (next >= 0 && next < cells.length) cells[next].focus();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = currentFocusIndex + 7;
        if (next < cells.length) cells[next].focus();
        else this.navigateMonth(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const next = currentFocusIndex - 7;
        if (next >= 0) cells[next].focus();
        else this.navigateMonth(-1);
      } else if (e.key === 'PageDown') {
        e.preventDefault();
        this.navigateMonth(e.shiftKey ? 12 : 1);
      } else if (e.key === 'PageUp') {
        e.preventDefault();
        this.navigateMonth(e.shiftKey ? -12 : -1);
      }
    });
  }

  open(): void {
    if (this.destroyed || this.state.getState().isOpen) return;
    this.state.setIsOpen(true);
    if (this.popup) {
      this.popup.style.display = 'block';
      // Trigger CSS transition animation
      requestAnimationFrame(() => {
        this.popup?.classList.add('dp-open');
      });
    }
    if (this.overlay) {
      this.overlay.style.display = 'block';
      requestAnimationFrame(() => {
        this.overlay?.classList.add('dp-open');
      });
    }
    this.events.emit('open', {});
  }

  close(): void {
    if (this.destroyed || !this.state.getState().isOpen) return;
    this.state.setIsOpen(false);
    if (this.popup) {
      this.popup.classList.remove('dp-open');
      this.popup.style.display = 'none';
    }
    if (this.overlay) {
      this.overlay.classList.remove('dp-open');
      this.overlay.style.display = 'none';
    }
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
    if (this.state.getState().selectedSmartDates.length > 0) {
      this.events.emit('change', { value: this.getValue(), smartDate: this.getSmartDate() });
    }
  }
}
