type CalendarType = 'jalali' | 'hijri' | 'gregorian';
type DateMode = 'single' | 'multiple' | 'range';
type FirstDayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type Theme = 'light' | 'dark' | 'material' | 'ios' | 'glass';
type Design = 'default' | 'rounded' | 'minimal' | 'bordered' | 'compact';
type Layout = 'popup' | 'inline' | 'multi-month';
type TimeFormat = '12h' | '24h';
type NumeralSystem = 'latn' | 'arabext' | 'arab';
type HijriPreset = 'tabular' | 'umm-alqura' | 'iranian';
interface BaseCalendarDate {
    year: number;
    month: number;
    day: number;
}
interface GregorianDate extends BaseCalendarDate {
    calendar: 'gregorian';
}
interface JalaliDate extends BaseCalendarDate {
    calendar: 'jalali';
}
interface HijriDate extends BaseCalendarDate {
    calendar: 'hijri';
}
type CalendarDate = GregorianDate | JalaliDate | HijriDate;
interface TimeValue {
    hour: number;
    minute: number;
    second: number;
    millisecond?: number;
}
interface LocaleConfig {
    code: string;
    direction: 'ltr' | 'rtl';
    days: string[];
    daysShort?: string[];
    daysMin?: string[];
    months: string[];
    monthsShort?: string[];
    firstDay: FirstDayOfWeek;
    today: string;
    select: string;
    clear: string;
    cancel: string;
    ok: string;
    placeholder: string;
    rangeSeparator: string;
    startDate: string;
    endDate: string;
    week: string;
    weekDay?: string[];
    month: string;
    year: string;
    decade?: string;
    calendar: CalendarType;
    navPrev?: string;
    navNext?: string;
    meridiem?: {
        am: string;
        pm: string;
    };
}
interface DatePickerOptions {
    calendar?: CalendarType;
    calendarSwitcher?: boolean;
    mode?: DateMode;
    value?: string | string[] | any;
    minDate?: string | any;
    maxDate?: string | any;
    disabledDates?: (string | any)[] | ((d: any) => boolean);
    disabledWeekdays?: number[];
    firstDayOfWeek?: FirstDayOfWeek;
    pattern?: string;
    format?: string;
    parse?: (input: string) => any | null;
    showTime?: boolean;
    timeFormat?: TimeFormat;
    hijriAdjustment?: number;
    hijriPreset?: HijriPreset;
    layout?: Layout;
    monthsCount?: number;
    theme?: Theme;
    design?: Design;
    locale?: string | Partial<LocaleConfig>;
    dir?: 'rtl' | 'ltr' | 'auto';
    numeralSystem?: NumeralSystem;
    inline?: boolean;
    placeholder?: string;
    zIndex?: number;
}
interface DatePickerInstance {
    open(): void;
    close(): void;
    toggle(): void;
    destroy(): void;
    getValue(): string | string[] | null;
    getSmartDate(): any | any[] | {
        start: any;
        end: any;
    } | null;
    setValue(v: any): void;
    clear(): void;
    setLocale(l: string): void;
    switchCalendar(c: CalendarType): void;
    formatDate(d: any, pattern?: string, calendar?: CalendarType): string;
    parseDate(s: string, pattern?: string, calendar?: CalendarType): any | null;
    on(event: string, cb: (payload: any) => void): () => void;
    update(options: Partial<DatePickerOptions>): void;
}
interface CalendarCell {
    date: Date;
    smartDate?: any;
    day: number;
    month: number;
    year: number;
    calendar?: CalendarType;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    isDisabled: boolean;
    isInRange: boolean;
    isRangeStart: boolean;
    isRangeEnd: boolean;
}
type DatePickerEvent = 'open' | 'close' | 'change' | 'select' | 'clear' | 'navigate' | 'calendar-change' | 'error';

/**
 * SmartDate.ts — Unified multi-calendar date class (PersianDate API style).
 *
 * Keeps Jalali, Hijri, and Gregorian representations synchronized via the
 * Julian Day Number (JDN) hub. Lazy computation & caching.
 */

declare class SmartDate {
    private _timestamp;
    private _hijriAdjustment;
    private _hijriPreset;
    private _cachedJDN;
    private _cachedGrg;
    private _cachedSh;
    private _cachedHj;
    private _cachedTime;
    constructor(input?: number | Date | SmartDate | string, hijriAdjustment?: number, hijriPreset?: HijriPreset);
    static fromTimestamp(ts: number, hijriAdjustment?: number, preset?: HijriPreset): SmartDate;
    static fromDate(d: Date, hijriAdjustment?: number, preset?: HijriPreset): SmartDate;
    static now(hijriAdjustment?: number, preset?: HijriPreset): SmartDate;
    private invalidateCache;
    private getTimeComponents;
    private getGrgComponents;
    private getJDN;
    private getShComponents;
    private getHjComponents;
    private updateFromGrg;
    private updateFromJDN;
    initGrgDate(): void;
    initJalaliDate(): void;
    initHijriDate(): void;
    getShYear(): number;
    getShMonth(): number;
    getShDay(): number;
    getHjYear(): number;
    getHjMonth(): number;
    getHjDay(): number;
    getGrgYear(): number;
    getGrgMonth(): number;
    getGrgDay(): number;
    getHour(): number;
    getMinute(): number;
    getSecond(): number;
    getMillisecond(): number;
    getTime(): number;
    toDate(): Date;
    setShYear(y: number): this;
    setShMonth(m: number): this;
    setShDay(d: number): this;
    setHjYear(y: number): this;
    setHjMonth(m: number): this;
    setHjDay(d: number): this;
    setGrgYear(y: number): this;
    setGrgMonth(m: number): this;
    setGrgDay(d: number): this;
    setHour(h: number): this;
    setMinute(m: number): this;
    setSecond(s: number): this;
    setMillisecond(ms: number): this;
    /** میلادی → شمسی */
    toJalali(y?: number, m?: number, d?: number): number[];
    static toJalali(y: number, m: number, d: number): number[];
    /** قمری → شمسی */
    toJalaliFromHijri(y?: number, m?: number, d?: number): number[];
    static toJalaliFromHijri(y: number, m: number, d: number, adjustment?: number): number[];
    /** شمسی → میلادی */
    toGregorian(y?: number, m?: number, d?: number): number[];
    static toGregorian(y: number, m: number, d: number): number[];
    /** قمری → میلادی */
    toGregorianFromHijri(y?: number, m?: number, d?: number): number[];
    static toGregorianFromHijri(y: number, m: number, d: number, adjustment?: number): number[];
    /** شمسی → قمری */
    toHijri(y?: number, m?: number, d?: number): number[];
    static toHijri(y: number, m: number, d: number, adjustment?: number): number[];
    /** میلادی → قمری */
    toHijriFromGregorian(y?: number, m?: number, d?: number): number[];
    static toHijriFromGregorian(y: number, m: number, d: number, adjustment?: number): number[];
    /** General converter between calendars */
    convert(from: CalendarType, to: CalendarType, y?: number, m?: number, d?: number): number[];
    static convert(from: CalendarType, to: CalendarType, y: number, m: number, d: number, adjustment?: number): number[];
    isLeap(calendar?: CalendarType): boolean;
    grgIsLeap(): boolean;
    hjIsLeap(): boolean;
    /**
     * Day of week: 0-6.
     * For Jalali: 0=Saturday (شنبه), 1=Sunday, ..., 6=Friday.
     * For Gregorian: 0=Sunday, 1=Monday, ..., 6=Saturday.
     * For Hijri: 0=Saturday (السبت) or Sunday. Defaults to 0=Saturday in Arabic week.
     */
    dayOfWeek(calendar?: CalendarType): number;
    getDayInYear(calendar?: CalendarType): number;
    getMonthDays(calendar?: CalendarType): number;
    getMonthLength(calendar?: CalendarType): number;
    getDaysInMonth(calendar: CalendarType, y: number, m: number): number;
    dayName(calendar?: CalendarType): string;
    monthName(calendar?: CalendarType): string;
    clone(): SmartDate;
    addDays(n: number): SmartDate;
    subDays(n: number): SmartDate;
    addMonths(n: number, calendar?: CalendarType): SmartDate;
    subMonths(n: number, calendar?: CalendarType): SmartDate;
    addYears(n: number, calendar?: CalendarType): SmartDate;
    subYears(n: number, calendar?: CalendarType): SmartDate;
    addDate(years: number, months: number, days: number): SmartDate;
    startOfDay(): SmartDate;
    startOfMonth(calendar?: CalendarType): SmartDate;
    startOfYear(calendar?: CalendarType): SmartDate;
    endOfMonth(calendar?: CalendarType): SmartDate;
    endOfYear(calendar?: CalendarType): SmartDate;
    after(other: SmartDate): boolean;
    before(other: SmartDate): boolean;
    equals(other: SmartDate): boolean;
    compare(other: SmartDate): number;
    diff(other: SmartDate, calendar?: CalendarType): {
        years: number;
        months: number;
        days: number;
    };
    untilToday(calendar?: CalendarType): {
        years: number;
        months: number;
        days: number;
    };
    getDayUntilToday(calendar?: CalendarType): number;
    format(pattern: string, calendar?: CalendarType): string;
}

declare class DatePicker implements DatePickerInstance {
    private options;
    private state;
    private events;
    private container;
    private inputEl;
    private clearBtnEl;
    private popup;
    private overlay;
    private liveRegion;
    private destroyed;
    private currentView;
    private focusedCellIndex;
    constructor(el: HTMLElement | string, options?: Partial<DatePickerOptions>);
    private initContainer;
    private initOptions;
    private initLocale;
    private getLocaleConfig;
    private setValueInternal;
    render(): void;
    renderCalendar(): void;
    private renderMonthsView;
    private renderYearsView;
    private selectDate;
    private updateInput;
    navigateMonth(delta: number): void;
    goToToday(): void;
    switchCalendar(newCal: CalendarType): void;
    private attachEvents;
    open(): void;
    close(): void;
    toggle(): void;
    destroy(): void;
    getValue(): string | string[] | null;
    getSmartDate(): SmartDate | SmartDate[] | {
        start: SmartDate;
        end: SmartDate;
    } | null;
    setValue(v: string | string[] | Date | Date[] | SmartDate | SmartDate[]): void;
    clear(): void;
    setLocale(l: string): void;
    formatDate(d: SmartDate | Date, pattern?: string, calendar?: CalendarType): string;
    parseDate(s: string, pattern?: string, calendar?: CalendarType): SmartDate | null;
    on(event: string, cb: (payload: any) => void): () => void;
    update(options: Partial<DatePickerOptions>): void;
}

/**
 * SmartDateFormat.ts — PHP-style formatting and parsing engine for SmartDate.
 *
 * Supports Jalali, Hijri, and Gregorian with PHP tokens (l, j, d, F, n, m, t, Y, y, w, z, L, H, g, h, i, s, a, A)
 * and parse tokens (yyyy, yy, MM, dd, HH, mm, ss, a).
 */

declare class InvalidDateFormatError extends Error {
    position: number;
    token: string;
    constructor(message: string, position?: number, token?: string);
}
declare const DEFAULT_PATTERNS: Record<CalendarType, {
    full: string;
    short: string;
    iso: string;
    datetime: string;
}>;
/** Normalize Persian and Arabic numerals to Latin digits. */
declare function normalizeDigits(input: string): string;
declare class SmartDateFormat {
    private pattern;
    constructor(pattern?: string);
    format(date: SmartDate, calendar?: CalendarType): string;
    static format(date: SmartDate, pattern: string, calendar?: CalendarType): string;
    static parse(dateStr: string, pattern?: string, calendar?: CalendarType): SmartDate;
    private static phpToParsePattern;
    static parseGrg(dateStr: string, pattern?: string): SmartDate;
    static parseHj(dateStr: string, pattern?: string): SmartDate;
    static tryParseAny(dateStr: string): SmartDate | null;
    private static parseWithPattern;
}

/**
 * convert.ts — JDN-based conversion hub between Gregorian, Jalali, and Hijri.
 */

/** Convert a CalendarDate to Julian Day Number. */
declare function toJDN(d: CalendarDate, hijriAdjustment?: number): number;
/** Convert a Julian Day Number to CalendarDate in the requested calendar. */
declare function fromJDN(jdn: number, calendar: CalendarType, hijriAdjustment?: number): CalendarDate;
declare function toGregorian(d: CalendarDate, hijriAdjustment?: number): GregorianDate;
declare function toJalali(d: CalendarDate, hijriAdjustment?: number): JalaliDate;
declare function toHijri(d: CalendarDate, hijriAdjustment?: number): HijriDate;
declare function isLeapYear(calendar: CalendarType, year: number): boolean;
declare function daysInMonth(calendar: CalendarType, year: number, month: number): number;
declare function daysInYear(calendar: CalendarType, year: number): number;
/** Return today as a CalendarDate in the given calendar. */
declare function todayIn(calendar: CalendarType, hijriAdjustment?: number): CalendarDate;
/** Compare two CalendarDates by converting to JDN. Returns -1, 0, or 1. */
declare function compareCalendarDates(a: CalendarDate, b: CalendarDate, hijriAdjustment?: number): -1 | 0 | 1;
/** Return true if two CalendarDates represent the same day. */
declare function isSameDay(a: CalendarDate, b: CalendarDate, hijriAdjustment?: number): boolean;
/** Gregorian JS Date → CalendarDate. */
declare function fromJSDate(jsDate: Date, calendar: CalendarType, hijriAdjustment?: number): CalendarDate;
/** CalendarDate → Gregorian JS Date. */
declare function toJSDate(d: CalendarDate, hijriAdjustment?: number): Date;
/** Add N days to a CalendarDate (returns same calendar). */
declare function addDays(d: CalendarDate, n: number, hijriAdjustment?: number): CalendarDate;
/** Add N months to a CalendarDate (clamped to month length). */
declare function addMonths(d: CalendarDate, n: number, hijriAdjustment?: number): CalendarDate;
/** Add N years to a CalendarDate (clamped to month length). */
declare function addYears(d: CalendarDate, n: number, hijriAdjustment?: number): CalendarDate;

/**
 * Jalali (Solar Hijri / Persian) calendar arithmetic.
 *
 * Implements the Khayyam-Birashk algorithm with the standard breaks array,
 * accurate for Jalali years 1206–3000 (Gregorian 1827–3621).
 *
 * References:
 *   - Borkowski, K.M. (1996) "The Persian Calendar for 3000 Years"
 *   - Birashk, Ahmad (1993) "A Comparative Calendar of the Iranian, Muslim Lunar,
 *     and Christian Eras for Three Thousand Years"
 *
 * Leap years follow the 33-year Jalali cycle; the leap-year remainders within
 * each 2820-year grand cycle are: {1, 5, 9, 13, 17, 22, 26, 30}.
 */
declare const BREAKS: readonly [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
/**
 * Given a Jalali year `jy`, compute:
 *  - `leap`:  0 if leap year (Esfand has 30 days), else 1..4
 *  - `gy`:    corresponding Gregorian year of Nowruz
 *  - `march`: day of March in which Nowruz falls (1-indexed; may be 20 or 21)
 */
declare function jalCal(jy: number): {
    leap: number;
    gy: number;
    march: number;
};
/** Returns true if Jalali year `jy` is a leap year (Esfand = 30 days). */
declare function isJalaliLeap(jy: number): boolean;
/**
 * Number of days in Jalali month (jm: 1–12).
 *  Months 1–6: 31 days
 *  Months 7–11: 30 days
 *  Month 12: 29 (normal) or 30 (leap)
 */
declare function jalaliMonthLength(jy: number, jm: number): number;
/** Number of days in Jalali year jy (365 or 366). */
declare function jalaliYearLength(jy: number): number;
/** 1-indexed day of year for a Jalali date. */
declare function jalaliDayOfYear(jm: number, jd: number): number;
/**
 * Convert Jalali date to Julian Day Number.
 * jm is 1-indexed.
 */
declare function jalaliToJDN(jy: number, jm: number, jd: number): number;
/**
 * Convert Julian Day Number to Jalali date { year, month, day }.
 * month is 1-indexed.
 */
declare function jdnToJalali(jdn: number): {
    year: number;
    month: number;
    day: number;
};
/** Day of week for a Jalali date. 0 = Saturday (Persian week start). */
declare function jalaliDayOfWeek(jy: number, jm: number, jd: number): number;

/**
 * Islamic / Hijri calendar arithmetic — Tabular (Kuwaiti) algorithm.
 *
 * This implements the "Tabular Islamic" calendar, also known as the
 * "Kuwaiti algorithm" or "arithmetic Islamic calendar".
 *
 * 30-year cycle with 11 leap years: {2,5,7,10,13,16,18,21,24,26,29}
 * In leap years, Dhul-Hijjah (month 12) has 30 days instead of 29.
 *
 * Supports hijriAdjustment (± days) and presets:
 * 'tabular' | 'umm-alqura' | 'iranian'
 *
 * Epoch: 1 Muharram 1 AH = Julian 16 July 622 CE = JDN 1948439
 */

/** JDN of 1 Muharram 1 AH (civil epoch). */
declare const HIJRI_EPOCH_JDN = 1948439;
/** Leap years within a 30-year Hijri cycle. */
declare const HIJRI_LEAP_YEARS: Set<number>;
/**
 * Resolves net adjustment in days given a preset and custom adjustment.
 */
declare function resolveHijriAdjustment(preset?: HijriPreset, userAdjustment?: number): number;
/** Returns true if Hijri year `hy` is a leap year (Dhul-Hijjah = 30 days). */
declare function isHijriLeap(hy: number): boolean;
/**
 * Number of days in Hijri month (hm: 1–12).
 *  Odd months (1,3,5,7,9,11): 30 days
 *  Even months (2,4,6,8,10):  29 days
 *  Month 12:                  29 (normal) or 30 (leap)
 */
declare function hijriMonthLength(hy: number, hm: number): number;
/** Number of days in Hijri year hy (354 or 355). */
declare function hijriYearLength(hy: number): number;
/**
 * Convert Hijri date to Julian Day Number.
 * hm is 1-indexed. Applies optional day adjustment.
 */
declare function hijriToJDN(hy: number, hm: number, hd: number, adjustment?: number): number;
/**
 * Convert Julian Day Number to Hijri date { year, month, day }.
 * month is 1-indexed. Applies optional day adjustment.
 */
declare function jdnToHijri(jdn: number, adjustment?: number): {
    year: number;
    month: number;
    day: number;
};
/** Day of week for a Hijri date. 0 = Saturday (Al-Sabt), 1 = Sunday ... 6 = Friday. */
declare function hijriDayOfWeek(hy: number, hm: number, hd: number, adjustment?: number): number;

/**
 * Gregorian calendar arithmetic.
 * All month numbers are 1-indexed (January = 1).
 */
/** Returns true if `year` is a Gregorian leap year. */
declare function isGregorianLeap(year: number): boolean;
/** Number of days in a Gregorian month (month: 1–12). */
declare function gregorianMonthLength(year: number, month: number): number;
/** Number of days in a Gregorian year. */
declare function gregorianYearLength(year: number): number;
/** 1-indexed day of year for a Gregorian date. */
declare function gregorianDayOfYear(year: number, month: number, day: number): number;
/**
 * Convert a Gregorian date to Julian Day Number.
 * Uses the proleptic Gregorian calendar.
 * Reference: JDN 2451545 = 1 January 2000 (J2000.0)
 */
declare function gregorianToJDN(year: number, month: number, day: number): number;
/**
 * Convert a Julian Day Number to a Gregorian date { year, month, day }.
 * month is 1-indexed.
 */
declare function jdnToGregorian(jdn: number): {
    year: number;
    month: number;
    day: number;
};
/** Day of week: 0 = Sunday … 6 = Saturday. */
declare function gregorianDayOfWeek(year: number, month: number, day: number): number;

declare function formatDate(date: Date | SmartDate, format: string, calendar?: CalendarType): string;
declare function parseDate(value: string | string[] | any, pattern?: string, calendar?: CalendarType): Date[];

declare function getLocale(code: string): LocaleConfig;
declare function mergeLocale(base: LocaleConfig, overrides?: Partial<LocaleConfig>): LocaleConfig;

export { BREAKS, type CalendarCell, type CalendarDate, type CalendarType, DEFAULT_PATTERNS, type DateMode, DatePicker, type DatePickerEvent, type DatePickerInstance, type DatePickerOptions, type Design, type FirstDayOfWeek, type GregorianDate, HIJRI_EPOCH_JDN, HIJRI_LEAP_YEARS, type HijriDate, type HijriPreset, InvalidDateFormatError, type JalaliDate, type Layout, type LocaleConfig, type NumeralSystem, SmartDate, SmartDateFormat, type Theme, type TimeFormat, type TimeValue, addDays, addMonths, addYears, compareCalendarDates, daysInMonth, daysInYear, formatDate, fromJDN, fromJSDate, getLocale, gregorianDayOfWeek, gregorianDayOfYear, gregorianMonthLength, gregorianToJDN, gregorianYearLength, hijriDayOfWeek, hijriMonthLength, hijriToJDN, hijriYearLength, isGregorianLeap, isHijriLeap, isJalaliLeap, isLeapYear, isSameDay, jalCal, jalaliDayOfWeek, jalaliDayOfYear, jalaliMonthLength, jalaliToJDN, jalaliYearLength, jdnToGregorian, jdnToHijri, jdnToJalali, mergeLocale, normalizeDigits, parseDate, resolveHijriAdjustment, toGregorian, toHijri, toJDN, toJSDate, toJalali, todayIn };
