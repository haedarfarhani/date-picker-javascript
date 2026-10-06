/**
 * my-datepicker — Vanilla / UMD entry point
 *
 * Re-exports everything from core so this package can be used:
 *   1. As a <script> tag  → window.MyDatepicker.DatePicker, window.MyDatepicker.SmartDate
 *   2. As an ESM import   → import { DatePicker, SmartDate } from 'my-datepicker'
 *   3. As a CJS require   → const { DatePicker, SmartDate } = require('my-datepicker')
 *
 * jQuery plugin (optional, loaded only when $ is available):
 *   $(el).datePicker(options)
 */

export {
  DatePicker,
  SmartDate,
  SmartDateFormat,
  InvalidDateFormatError,
  DEFAULT_PATTERNS,
  normalizeDigits,
  toJalali,
  toGregorian,
  toHijri,
} from 'my-datepicker-core';

export type {
  DatePickerOptions,
  DatePickerInstance,
  DateMode,
  CalendarType,
  FirstDayOfWeek,
  Theme,
  Design,
  Layout,
  TimeFormat,
  NumeralSystem,
  LocaleConfig,
  DatePickerEvent,
} from 'my-datepicker-core';

// ---------------------------------------------------------------------------
// jQuery plugin (no-op if jQuery is not available)
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    jQuery?: JQueryStatic;
    $?: JQueryStatic;
    MyDatepicker?: any;
  }
}

interface JQueryStatic {
  fn: Record<string, unknown>;
}

import { DatePicker } from 'my-datepicker-core';
import type { DatePickerOptions } from 'my-datepicker-core';

/**
 * Register a jQuery plugin `$.fn.datePicker` when jQuery is detected.
 */
function registerJQueryPlugin(): void {
  const $ = (typeof window !== 'undefined' && (window.jQuery || window.$)) as JQueryStatic | false;
  if (!$ || !$.fn) return;

  ($.fn as any).datePicker = function datePicker(
    this: ArrayLike<HTMLElement>,
    options: Partial<DatePickerOptions> = {}
  ) {
    const instances: DatePicker[] = [];
    for (let i = 0; i < this.length; i++) {
      instances.push(new DatePicker(this[i], options));
    }
    return instances.length === 1 ? instances[0] : instances;
  };
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerJQueryPlugin);
  } else {
    registerJQueryPlugin();
  }
}
