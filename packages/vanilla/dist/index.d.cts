export { CalendarType, DEFAULT_PATTERNS, DateMode, DatePicker, DatePickerEvent, DatePickerInstance, DatePickerOptions, Design, FirstDayOfWeek, InvalidDateFormatError, Layout, LocaleConfig, NumeralSystem, SmartDate, SmartDateFormat, Theme, TimeFormat, normalizeDigits, toGregorian, toHijri, toJalali } from 'my-datepicker-core';

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
