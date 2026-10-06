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

  if (cell.isToday && !cell.isSelected) {
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

  // Hour input
  const hourInput = document.createElement('input');
  hourInput.type = 'number';
  hourInput.className = 'dp-time-input dp-time-hour';
  hourInput.min = is12h ? '1' : '0';
  hourInput.max = is12h ? '12' : '23';
  hourInput.value = String(displayHour).padStart(2, '0');

  // Separator
  const sep = document.createElement('span');
  sep.className = 'dp-time-sep';
  sep.textContent = ':';

  // Minute input
  const minInput = document.createElement('input');
  minInput.type = 'number';
  minInput.className = 'dp-time-input dp-time-minute';
  minInput.min = '0';
  minInput.max = '59';
  minInput.value = String(minute).padStart(2, '0');

  const emit = () => {
    let h = parseInt(hourInput.value, 10) || 0;
    const m = parseInt(minInput.value, 10) || 0;
    if (is12h) {
      if (isPM && h < 12) h += 12;
      if (!isPM && h === 12) h = 0;
    }
    onChange(Math.max(0, Math.min(23, h)), Math.max(0, Math.min(59, m)));
  };

  hourInput.addEventListener('change', emit);
  minInput.addEventListener('change', emit);

  container.appendChild(hourInput);
  container.appendChild(sep);
  container.appendChild(minInput);

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
  container.appendChild(popup);
  return popup;
}

export function applyTheme(el: HTMLElement, theme: Theme = 'light'): void {
  el.classList.remove(
    'dp-theme-light',
    'dp-theme-dark',
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
}
