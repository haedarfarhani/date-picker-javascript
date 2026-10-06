import { describe, it, expect } from 'vitest';
import { getLocale, mergeLocale, getCalendarForLocale, getFirstDayOfWeek } from './i18n';
import type { LocaleConfig } from './types';

describe('i18n', () => {
  it('returns en-US locale by code', () => {
    const locale = getLocale('en-US');
    expect(locale.code).toBe('en-US');
    expect(locale.direction).toBe('ltr');
    expect(locale.firstDay).toBe(0);
    expect(locale.calendar).toBe('gregorian');
    expect(locale.months.length).toBe(12);
    expect(locale.weekDay.length).toBe(7);
  });

  it('returns fa-IR locale by code', () => {
    const locale = getLocale('fa-IR');
    expect(locale.code).toBe('fa-IR');
    expect(locale.direction).toBe('rtl');
    expect(locale.firstDay).toBe(6);
    expect(locale.calendar).toBe('jalali');
  });

  it('returns ar-SA locale by code', () => {
    const locale = getLocale('ar-SA');
    expect(locale.code).toBe('ar-SA');
    expect(locale.direction).toBe('rtl');
    expect(locale.firstDay).toBe(6);
    expect(locale.calendar).toBe('gregorian');
    expect(locale.ok).toBe('موافق');
    expect(locale.clear).toBe('مسح');
  });

  it('derives fa from fa-IR', () => {
    const locale = getLocale('fa');
    expect(locale.code).toBe('fa-IR');
    expect(locale.calendar).toBe('jalali');
  });

  it('derives ar from ar-SA', () => {
    const locale = getLocale('ar');
    expect(locale.code).toBe('ar-SA');
    expect(locale.direction).toBe('rtl');
  });

  it('falls back to en-US for unknown locale', () => {
    const locale = getLocale('xx-YY');
    expect(locale.code).toBe('en-US');
  });

  it('merges partial overrides into a base locale', () => {
    const base = getLocale('en-US');
    const merged = mergeLocale(base, { placeholder: 'Pick a date', today: 'Now' });
    expect(merged.code).toBe('en-US');
    expect(merged.placeholder).toBe('Pick a date');
    expect(merged.today).toBe('Now');
    expect(merged.months).toEqual(base.months);
  });

  it('does not mutate the base locale on merge', () => {
    const base = getLocale('en-US');
    const beforeMonths = base.months;
    mergeLocale(base, { placeholder: 'changed' });
    expect(base.months).toBe(beforeMonths);
    expect(base.placeholder).toBe('Select date');
  });

  it('returns calendar type from locale', () => {
    expect(getCalendarForLocale(getLocale('fa-IR'))).toBe('jalali');
    expect(getCalendarForLocale(getLocale('en-US'))).toBe('gregorian');
  });

  it('returns first day from locale', () => {
    expect(getFirstDayOfWeek(getLocale('en-US'))).toBe(0);
    expect(getFirstDayOfWeek(getLocale('fa-IR'))).toBe(6);
    expect(getFirstDayOfWeek(getLocale('ar-SA'))).toBe(6);
  });

  it('exposes locale config shape', () => {
    const locale = getLocale('en-US');
    const expectedKeys: (keyof LocaleConfig)[] = [
      'code',
      'direction',
      'days',
      'months',
      'firstDay',
      'today',
      'select',
      'clear',
      'cancel',
      'ok',
      'placeholder',
      'rangeSeparator',
      'startDate',
      'endDate',
      'week',
      'weekDay',
      'month',
      'year',
      'calendar',
    ];
    for (const key of expectedKeys) {
      expect(locale).toHaveProperty(key);
    }
  });
});
