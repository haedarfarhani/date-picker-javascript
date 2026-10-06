import type {
  LocaleConfig,
  CalendarCell,
  CalendarType,
  Theme,
  Design,
  Layout,
  TimeFormat,
  NumeralSystem,
} from './types';

const NUMERAL_MAPS: Record<NumeralSystem, string> = {
  latn:    '0123456789',
  arab:    '٠١٢٣٤٥٦٧٨٩',
  arabext: '۰۱۲۳۴۵۶۷۸۹',
};

export function toLocalDigits(n: number | string, system: NumeralSystem = 'latn'): string {
  if (system === 'latn') return String(n);
  const map = NUMERAL_MAPS[system] || NUMERAL_MAPS.latn;
  return String(n).replace(/\d/g, (d) => map[parseInt(d, 10)]);
}

// Chevron SVGs
export const CHEVRON_LEFT_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 18l-6-6 6-6"/></svg>`;
export const CHEVRON_RIGHT_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 18l6-6-6-6"/></svg>`;
export const CALENDAR_ICON_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;

export function createCalendarCellElement(
  cell: CalendarCell,
  locale: LocaleConfig,
  numeralSystem: NumeralSystem = 'latn'
): HTMLElement {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'dp-day';
  el.setAttribute('role', 'gridcell');

  if (cell.isSelected) {
    el.classList.add('dp-day--selected');
    el.setAttribute('aria-selected', 'true');
  } else {
    el.setAttribute('aria-selected', 'false');
  }

  if (cell.isToday) {
    el.classList.add('dp-day--today');
  }

  if (cell.isDisabled) {
    el.classList.add('dp-day--disabled');
    el.setAttribute('aria-disabled', 'true');
    el.disabled = true;
  }

  if (cell.isRangeStart) {
    el.classList.add('dp-day--range-start');
  }

  if (cell.isRangeEnd) {
    el.classList.add('dp-day--range-end');
  }

  if (cell.isInRange) {
    el.classList.add('dp-day--in-range');
  }

  if (!cell.isCurrentMonth) {
    el.classList.add('dp-day--other-month');
  }

  el.textContent = toLocalDigits(cell.day, numeralSystem);
  el.setAttribute('data-date', cell.date.toISOString());
  el.setAttribute('data-day', String(cell.day));
  el.setAttribute('data-month', String(cell.month));
  el.setAttribute('data-year', String(cell.year));

  return el;
}

export function createWeekdayHeaders(locale: LocaleConfig): HTMLElement[] {
  const headers: HTMLElement[] = [];
  const days = [...locale.days];

  const firstDay = locale.firstDay;
  for (let i = 0; i < firstDay; i++) {
    const day = days.shift();
    if (day) {
      days.push(day);
    }
  }

  for (const day of days) {
    const el = document.createElement('div');
    el.className = 'dp-weekday';
    el.textContent = day;
    headers.push(el);
  }

  return headers;
}

export function createCalendarSwitcher(
  currentCalendar: CalendarType,
  onSwitch: (cal: CalendarType) => void
): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'dp-calendar-switcher';

  const calendars: { id: CalendarType; label: string }[] = [
    { id: 'jalali', label: 'شمسی' },
    { id: 'gregorian', label: 'میلادی' },
    { id: 'hijri', label: 'قمری' },
  ];

  calendars.forEach((c) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dp-calendar-switcher-btn';
    if (c.id === currentCalendar) {
      btn.classList.add('dp-calendar-switcher-btn--active');
    }
    btn.textContent = c.label;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      onSwitch(c.id);
    });
    wrapper.appendChild(btn);
  });

  return wrapper;
}

export function createTimePicker(
  hour: number,
  minute: number,
  timeFormat: TimeFormat,
  onChange: (h: number, m: number) => void
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'dp-timepicker';

  const label = document.createElement('span');
  label.className = 'dp-time-label';
  label.textContent = 'زمان:';
  container.appendChild(label);

  const is12h = timeFormat === '12h';
  let isPM = hour >= 12;
  let displayHour = is12h ? hour % 12 || 12 : hour;

  // Hour stepper
  const hourStepper = document.createElement('div');
  hourStepper.className = 'dp-time-stepper';

  const hourInput = document.createElement('input');
  hourInput.type = 'text';
  hourInput.className = 'dp-time-input dp-time-hour';
  hourInput.value = String(displayHour).padStart(2, '0');

  const btnHourUp = document.createElement('button');
  btnHourUp.type = 'button';
  btnHourUp.className = 'dp-time-btn';
  btnHourUp.innerHTML = '+';

  const btnHourDown = document.createElement('button');
  btnHourDown.type = 'button';
  btnHourDown.className = 'dp-time-btn';
  btnHourDown.innerHTML = '−';

  hourStepper.appendChild(btnHourDown);
  hourStepper.appendChild(hourInput);
  hourStepper.appendChild(btnHourUp);

  // Separator
  const sep = document.createElement('span');
  sep.className = 'dp-time-sep';
  sep.textContent = ':';

  // Minute stepper
  const minStepper = document.createElement('div');
  minStepper.className = 'dp-time-stepper';

  const minInput = document.createElement('input');
  minInput.type = 'text';
  minInput.className = 'dp-time-input dp-time-minute';
  minInput.value = String(minute).padStart(2, '0');

  const btnMinUp = document.createElement('button');
  btnMinUp.type = 'button';
  btnMinUp.className = 'dp-time-btn';
  btnMinUp.innerHTML = '+';

  const btnMinDown = document.createElement('button');
  btnMinDown.type = 'button';
  btnMinDown.className = 'dp-time-btn';
  btnMinDown.innerHTML = '−';

  minStepper.appendChild(btnMinDown);
  minStepper.appendChild(minInput);
  minStepper.appendChild(btnMinUp);

  const emit = () => {
    let h = parseInt(hourInput.value, 10) || 0;
    let m = parseInt(minInput.value, 10) || 0;
    if (is12h) {
      if (isPM && h < 12) h += 12;
      if (!isPM && h === 12) h = 0;
    }
    onChange(Math.max(0, Math.min(23, h)), Math.max(0, Math.min(59, m)));
  };

  btnHourUp.addEventListener('click', (e) => {
    e.stopPropagation();
    let h = parseInt(hourInput.value, 10) || 0;
    h = is12h ? (h % 12) + 1 : (h + 1) % 24;
    hourInput.value = String(h).padStart(2, '0');
    emit();
  });

  btnHourDown.addEventListener('click', (e) => {
    e.stopPropagation();
    let h = parseInt(hourInput.value, 10) || 0;
    h = is12h ? (h <= 1 ? 12 : h - 1) : (h <= 0 ? 23 : h - 1);
    hourInput.value = String(h).padStart(2, '0');
    emit();
  });

  btnMinUp.addEventListener('click', (e) => {
    e.stopPropagation();
    let m = (parseInt(minInput.value, 10) || 0) + 5;
    if (m >= 60) m = 0;
    minInput.value = String(m).padStart(2, '0');
    emit();
  });

  btnMinDown.addEventListener('click', (e) => {
    e.stopPropagation();
    let m = (parseInt(minInput.value, 10) || 0) - 5;
    if (m < 0) m = 55;
    minInput.value = String(m).padStart(2, '0');
    emit();
  });

  container.appendChild(hourStepper);
  container.appendChild(sep);
  container.appendChild(minStepper);

  if (is12h) {
    const ampmBtn = document.createElement('button');
    ampmBtn.type = 'button';
    ampmBtn.className = 'dp-ampm-btn';
    ampmBtn.textContent = isPM ? 'ب.ظ / PM' : 'ق.ظ / AM';
    ampmBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isPM = !isPM;
      ampmBtn.textContent = isPM ? 'ب.ظ / PM' : 'ق.ظ / AM';
      emit();
    });
    container.appendChild(ampmBtn);
  }

  return container;
}

export function createOverlay(trigger: HTMLElement): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'dp-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.style.display = 'none';
  return overlay;
}

export function createPopup(container: HTMLElement, zIndex: number): HTMLElement {
  const popup = document.createElement('div');
  popup.className = 'dp-popup';
  popup.setAttribute('role', 'dialog');
  popup.setAttribute('aria-modal', 'true');
  popup.setAttribute('aria-label', 'Date picker');
  popup.setAttribute('tabindex', '-1');
  popup.style.zIndex = String(zIndex);
  popup.style.display = 'none';

  // Mobile drag handle
  const handle = document.createElement('div');
  handle.className = 'dp-drag-handle';
  popup.appendChild(handle);

  container.appendChild(popup);
  return popup;
}

export function applyTheme(el: HTMLElement, theme: Theme = 'light'): void {
  el.classList.remove(
    'dp-theme-light',
    'dp-theme-dark',
    'dp-theme-auto',
    'dp-theme-material',
    'dp-theme-ios',
    'dp-theme-glass'
  );
  el.classList.add(`dp-theme-${theme}`);
}

export function applyDesign(el: HTMLElement, design: Design = 'default'): void {
  el.classList.remove(
    'dp-design-default',
    'dp-design-rounded',
    'dp-design-minimal',
    'dp-design-bordered',
    'dp-design-compact'
  );
  el.classList.add(`dp-design-${design}`);
}

export function applyLayout(el: HTMLElement, layout: Layout = 'popup'): void {
  el.classList.remove('dp-layout-popup', 'dp-layout-inline', 'dp-layout-multi-month');
  el.classList.add(`dp-layout-${layout}`);
}

export function applyDirection(popup: HTMLElement, direction: 'ltr' | 'rtl'): void {
  popup.setAttribute('dir', direction);
  popup.style.direction = direction;
  if (direction === 'rtl') {
    popup.classList.add('dp-rtl');
  } else {
    popup.classList.remove('dp-rtl');
  }
}
