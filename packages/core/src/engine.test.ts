import { describe, it, expect } from 'vitest';
import * as engine from './engine';
import type { CalendarType } from './types';

describe('engine', () => {
  it('formats a Gregorian date to ISO', () => {
    const date = new Date(2026, 9, 6);
    expect(engine.ISOFromDate(date)).toBe('2026-10-06');
  });

  it('returns today status for today', () => {
    const today = new Date();
    expect(engine.isToday(today)).toBe(true);
  });

  it('returns today status for another date', () => {
    const other = new Date(2020, 0, 1);
    expect(engine.isToday(other)).toBe(false);
  });

  it('builds a Gregorian calendar month', () => {
    const month = engine.buildCalendarMonth(2026, 9, 0, 'gregorian', {
      minDate: null,
      maxDate: null,
      disabledDates: new Set(),
      disabledDateFn: null,
    });
    expect(month.year).toBe(2026);
    expect(month.month).toBe(9);
    expect(month.calendar).toBe('gregorian');
    expect(month.weeks.length).toBeGreaterThanOrEqual(4);
    expect(month.firstDayOfMonth.day).toBe(1);
  });

  it('returns days in month for Gregorian', () => {
    expect(engine.getDaysInMonth(2026, 9, 'gregorian')).toBe(31);
    expect(engine.getDaysInMonth(2026, 1, 'gregorian')).toBe(28);
  });

  it('returns days in month for Jalali', () => {
    const days = engine.getDaysInMonth(1405, 0, 'jalali');
    expect(days).toBeGreaterThanOrEqual(29);
    expect(days).toBeLessThanOrEqual(31);
  });

  it('returns days in month for Hijri', () => {
    const days = engine.getDaysInMonth(1448, 0, 'hijri');
    expect(days).toBeGreaterThanOrEqual(29);
    expect(days).toBeLessThanOrEqual(30);
  });

  it('disables a date outside min/max', () => {
    const min = new Date(2026, 0, 1);
    const max = new Date(2026, 0, 5);
    const before = new Date(2025, 11, 31);
    const after = new Date(2026, 0, 6);
    const within = new Date(2026, 0, 3);
    const limits = { minDate: min, maxDate: max, disabledDates: new Set(), disabledDateFn: null };
    expect(engine.isDateDisabled(before, limits)).toBe(true);
    expect(engine.isDateDisabled(after, limits)).toBe(true);
    expect(engine.isDateDisabled(within, limits)).toBe(false);
  });

  it('disables a date in the disabled set', () => {
    const set = new Set(['2026-10-06']);
    const date = new Date(2026, 9, 6);
    const limits = { minDate: null, maxDate: null, disabledDates: set, disabledDateFn: null };
    expect(engine.isDateDisabled(date, limits)).toBe(true);
  });

  it('disables a date matching the disabled function', () => {
    const fn = (d: Date) => d.getDay() === 0;
    const sunday = new Date(2026, 9, 4);
    const monday = new Date(2026, 9, 5);
    const limits = { minDate: null, maxDate: null, disabledDates: new Set(), disabledDateFn: fn };
    expect(engine.isDateDisabled(sunday, limits)).toBe(true);
    expect(engine.isDateDisabled(monday, limits)).toBe(false);
  });

  it('parses a Gregorian value', () => {
    expect(engine.parseDateValue('2026-10-06')).toEqual(new Date(2026, 9, 6));
  });

  it('parses a Jalali value when supported', () => {
    const result = engine.parseDateValue('1405-07-15', 'jalali');
    expect(result).toBeInstanceOf(Date);
    expect(result).not.toBeNull();
  });

  it('returns null for invalid parse input', () => {
    expect(engine.parseDateValue('not-a-date')).toBeNull();
    expect(engine.parseDateValue('2026-13-01')).toBeNull();
  });

  it('compares equal dates', () => {
    const a = new Date(2026, 9, 6);
    const b = new Date(2026, 9, 6);
    const c = new Date(2026, 9, 7);
    expect(engine.dateEquals(a, b)).toBe(true);
    expect(engine.dateEquals(a, c)).toBe(false);
  });

  it('returns calendar components for a Gregorian date', () => {
    const date = new Date(2026, 9, 6);
    const comp = engine.toCalendarComponents(date, 'gregorian');
    expect(comp).not.toBeNull();
    expect(comp?.year).toBe(2026);
    expect(comp?.month).toBe(9);
    expect(comp?.day).toBe(6);
  });

  it('returns calendar components for a Jalali date', () => {
    const date = new Date(2026, 9, 6);
    const comp = engine.toCalendarComponents(date, 'jalali');
    expect(comp).not.toBeNull();
    expect(comp?.year).toBeGreaterThan(1400);
  });
});
