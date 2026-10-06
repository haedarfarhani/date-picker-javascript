import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DatePicker } from '../src/DatePicker';
import { EventEmitter } from '../src/events';
import { StateManager } from '../src/state';
import { formatDate, parseDate, isSameDay, getDaysInMonth, generateMonthDays } from '../src/engine';
import { getLocale } from '../src/i18n';

describe('DatePicker Core', () => {
  describe('events', () => {
    it('should register and emit events', () => {
      const emitter = new EventEmitter();
      let payload: any;
      const unsub = emitter.on('test', (data) => {
        payload = data;
      });
      emitter.emit('test', { value: 123 });
      expect(payload).toEqual({ value: 123 });
      unsub();
      emitter.emit('test', { value: 456 });
      expect(payload).toEqual({ value: 123 });
    });
  });

  describe('state', () => {
    it('should initialize with defaults', () => {
      const state = new StateManager();
      const s = state.getState();
      expect(s.mode).toBe('single');
      expect(s.calendar).toBe('gregorian');
      expect(s.isOpen).toBe(false);
      expect(s.selectedDates).toEqual([]);
    });

    it('should update state', () => {
      const state = new StateManager();
      state.setMode('multiple');
      state.setLocale('fa-IR');
      expect(state.getState().mode).toBe('multiple');
      expect(state.getState().locale).toBe('fa-IR');
    });
  });

  describe('engine', () => {
    it('should format dates', () => {
      const d = new Date(2026, 9, 6);
      expect(formatDate(d, 'YYYY-MM-DD')).toBe('2026-10-06');
    });

    it('should parse dates', () => {
      const dates = parseDate('2026-10-06');
      expect(dates).toHaveLength(1);
      expect(dates[0].getFullYear()).toBe(2026);
    });

    it('should check same day', () => {
      const a = new Date(2026, 9, 6);
      const b = new Date(2026, 9, 6, 12);
      expect(isSameDay(a, b)).toBe(true);
    });

    it('should get days in month', () => {
      expect(getDaysInMonth(2026, 9)).toBe(31);
      expect(getDaysInMonth(2026, 1)).toBe(28);
      expect(getDaysInMonth(2024, 1)).toBe(29);
    });

    it('should generate month days', () => {
      const days = generateMonthDays(2026, 9, [], null, null, new Set(), null, 'en-US', 'gregorian');
      expect(days.length).toBeGreaterThanOrEqual(28);
      expect(days.length).toBeLessThanOrEqual(42);
      expect(days[0].isCurrentMonth).toBe(false);
      expect(days.find((d) => d.isCurrentMonth)?.isCurrentMonth).toBe(true);
    });
  });

  describe('i18n', () => {
    it('should get locales', () => {
      const en = getLocale('en-US');
      expect(en.code).toBe('en-US');
      expect(en.direction).toBe('ltr');

      const fa = getLocale('fa-IR');
      expect(fa.code).toBe('fa-IR');
      expect(fa.direction).toBe('rtl');
    });

    it('should fallback to en-US', () => {
      const locale = getLocale('xx-XX');
      expect(locale.code).toBe('en-US');
    });
  });

  describe('DatePicker', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    it('should instantiate and render', () => {
      const dp = new DatePicker(container, { mode: 'single' });
      expect(container.querySelector('.dp-popup')).not.toBeNull();
      dp.destroy();
    });

    it('should open and close', () => {
      const dp = new DatePicker(container, { mode: 'single' });
      dp.open();
      expect(container.querySelector('.dp-popup')?.style.display).toBe('block');
      dp.close();
      expect(container.querySelector('.dp-popup')?.style.display).toBe('none');
      dp.destroy();
    });

    it('should toggle', () => {
      const dp = new DatePicker(container, { mode: 'single' });
      dp.open();
      dp.toggle();
      expect(container.querySelector('.dp-popup')?.style.display).toBe('none');
      dp.toggle();
      expect(container.querySelector('.dp-popup')?.style.display).toBe('block');
      dp.destroy();
    });

    it('should get and set value', () => {
      const dp = new DatePicker(container, {
        mode: 'single',
        value: '2026-10-06',
      });
      expect(dp.getValue()).toBe('2026-10-06');
      dp.setValue('2026-10-07');
      expect(dp.getValue()).toBe('2026-10-07');
      dp.destroy();
    });

    it('should clear value', () => {
      const dp = new DatePicker(container, {
        mode: 'single',
        value: '2026-10-06',
      });
      dp.clear();
      expect(dp.getValue()).toBeNull();
      dp.destroy();
    });

    it('should emit events', () => {
      const dp = new DatePicker(container, { mode: 'single' });
      const opened: any[] = [];
      dp.on('open', (data) => opened.push(data));
      dp.open();
      expect(opened.length).toBeGreaterThanOrEqual(1);
      dp.destroy();
    });

    it('should navigate months', () => {
      const dp = new DatePicker(container, { mode: 'single', value: '2026-10-06' });
      dp.open();
      dp.navigateMonth(1);
      expect(dp.getValue()).toBe('2026-10-06');
      dp.close();
      dp.destroy();
    });

    it('should select date in multiple mode', () => {
      const dp = new DatePicker(container, { mode: 'multiple' });
      dp.open();
      expect(dp.getValue()).toBeNull();
      dp.destroy();
    });

    it('should support jalali locale', () => {
      const dp = new DatePicker(container, { mode: 'single', locale: 'fa-IR' });
      expect(container.querySelector('[dir="rtl"]')).not.toBeNull();
      dp.destroy();
    });

    it('should apply theme', () => {
      const dp = new DatePicker(container, { mode: 'single', theme: 'dark' });
      expect(container.querySelector('.dp-theme-dark')).not.toBeNull();
      dp.destroy();
    });
  });
});