import type { LocaleConfig, CalendarCell } from './types';
import { getLocale } from './i18n';

export function createCalendarCellElement(cell: CalendarCell, locale: LocaleConfig): HTMLElement {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'dp-day';

  if (cell.isSelected) {
    el.classList.add('dp-day--selected');
  }
  if (cell.isToday && !cell.isSelected) {
    el.classList.add('dp-day--today');
  }
  if (cell.isDisabled) {
    el.classList.add('dp-day--disabled');
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

  el.textContent = String(cell.day);
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

export function createYearSelect(
  viewYear: number,
  minYear?: number,
  maxYear?: number
): HTMLElement {
  const select = document.createElement('select');
  select.className = 'dp-year-select';

  const start = minYear || viewYear - 20;
  const end = maxYear || viewYear + 20;

  for (let year = start; year <= end; year++) {
    const option = document.createElement('option');
    option.value = String(year);
    option.textContent = String(year);
    if (year === viewYear) {
      option.selected = true;
    }
    select.appendChild(option);
  }

  return select;
}

export function createMonthSelect(months: string[], viewMonth: number): HTMLElement {
  const select = document.createElement('select');
  select.className = 'dp-month-select';

  for (let i = 0; i < months.length; i++) {
    const option = document.createElement('option');
    option.value = String(i);
    option.textContent = months[i];
    if (i === viewMonth) {
      option.selected = true;
    }
    select.appendChild(option);
  }

  return select;
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
  popup.setAttribute('aria-label', 'Date picker');
  popup.setAttribute('tabindex', '-1');
  popup.style.zIndex = String(zIndex);
  container.appendChild(popup);
  return popup;
}

export function applyTheme(popup: HTMLElement, theme: 'light' | 'dark'): void {
  if (theme === 'dark') {
    popup.classList.add('dp-theme-dark');
  } else {
    popup.classList.remove('dp-theme-dark');
  }
}

export function applyDirection(popup: HTMLElement, direction: 'ltr' | 'rtl'): void {
  popup.setAttribute('dir', direction);
  popup.style.direction = direction;
}