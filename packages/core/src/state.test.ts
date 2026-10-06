import { describe, it, expect } from 'vitest';
import { StateManager } from './state';
import type { DateMode, CalendarType, Theme } from './types';

describe('StateManager', () => {
  it('creates with defaults', () => {
    const state = new StateManager();
    const values = state.getState();
    expect(values.mode).toBe('single');
    expect(values.calendar).toBe('gregorian');
    expect(values.isOpen).toBe(false);
    expect(values.theme).toBe('light');
    expect(values.locale).toBe('en-US');
    expect(values.selectedDates).toEqual([]);
    expect(values.minDate).toBeNull();
    expect(values.maxDate).toBeNull();
  });

  it('applies partial overrides', () => {
    const state = new StateManager({
      mode: 'range',
      calendar: 'jalali' as CalendarType,
      theme: 'dark' as Theme,
      locale: 'fa-IR',
      selectedDates: [new Date(2026, 9, 6)],
      minDate: new Date(2026, 0, 1),
      maxDate: new Date(2026, 11, 31),
    });
    const values = state.getState();
    expect(values.mode).toBe('range');
    expect(values.calendar).toBe('jalali');
    expect(values.theme).toBe('dark');
    expect(values.locale).toBe('fa-IR');
    expect(values.selectedDates.length).toBe(1);
    expect(values.minDate).not.toBeNull();
    expect(values.maxDate).not.toBeNull();
  });

  it('setters update state', () => {
    const state = new StateManager();
    state.setMode('multiple');
    state.setCalendar('hijri' as CalendarType);
    state.setIsOpen(true);
    state.setTheme('dark' as Theme);
    state.setLocale('fa-IR');
    state.setFirstDayOfWeek(6);
    state.setSelectedDates([new Date(2026, 9, 6)]);
    state.setMinDate(new Date(2026, 0, 1));
    state.setMaxDate(new Date(2026, 11, 31));
    state.setDisabledDates(new Set(['2026-10-06']), null);
    state.setShowTime(true);
    state.setTimeFormat('12h' as const);
    state.setInline(true);
    state.setPlaceholder('Pick');
    state.setZIndex(2000);
    state.setFormat('DD/MM/YYYY');
    const values = state.getState();
    expect(values.mode).toBe('multiple');
    expect(values.calendar).toBe('hijri');
    expect(values.isOpen).toBe(true);
    expect(values.theme).toBe('dark');
    expect(values.locale).toBe('fa-IR');
    expect(values.firstDayOfWeek).toBe(6);
    expect(values.selectedDates.length).toBe(1);
    expect(values.disabledDates.has('2026-10-06')).toBe(true);
    expect(values.showTime).toBe(true);
    expect(values.timeFormat).toBe('12h');
    expect(values.inline).toBe(true);
    expect(values.placeholder).toBe('Pick');
    expect(values.zIndex).toBe(2000);
    expect(values.format).toBe('DD/MM/YYYY');
  });

  it('setState merges partial state', () => {
    const state = new StateManager({ mode: 'single' });
    state.setState({ theme: 'dark' as Theme });
    expect(state.getState().mode).toBe('single');
    expect(state.getState().theme).toBe('dark');
  });

  it('setViewDate updates viewMonth and viewYear', () => {
    const state = new StateManager({ viewDate: new Date(2026, 9, 6) });
    state.setViewDate(new Date(2027, 2, 15));
    const values = state.getState();
    expect(values.viewMonth).toBe(2);
    expect(values.viewYear).toBe(2027);
  });
});
