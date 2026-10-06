type CalendarType = 'gregorian' | 'jalali' | 'hijri';
type DateMode = 'single' | 'multiple' | 'range';
type FirstDayOfWeek = 0 | 1 | 6;
type Theme = 'light' | 'dark';
type TimeFormat = '12h' | '24h';
interface LocaleConfig {
    code: string;
    direction: 'ltr' | 'rtl';
    days: string[];
    months: string[];
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
    weekDay: string[];
    month: string;
    year: string;
    calendar: CalendarType;
    navPrev?: string;
    navNext?: string;
}
interface DatePickerOptions {
    mode?: DateMode;
    value?: string | string[];
    minDate?: string;
    maxDate?: string;
    disabledDates?: string[] | ((d: Date) => boolean);
    firstDayOfWeek?: FirstDayOfWeek;
    locale?: string | Partial<LocaleConfig>;
    calendar?: CalendarType;
    format?: string;
    showTime?: boolean;
    timeFormat?: TimeFormat;
    inline?: boolean;
    placeholder?: string;
    theme?: Theme;
    zIndex?: number;
}
interface DatePickerInstance {
    open(): void;
    close(): void;
    toggle(): void;
    destroy(): void;
    getValue(): string | string[] | null;
    setValue(v: string | string[]): void;
    clear(): void;
    setLocale(l: string): void;
    on(event: string, cb: (payload: any) => void): () => void;
    update(options: Partial<DatePickerOptions>): void;
}
interface CalendarCell {
    date: Date;
    day: number;
    month: number;
    year: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    isDisabled: boolean;
    isInRange: boolean;
    isRangeStart: boolean;
    isRangeEnd: boolean;
}
type DatePickerEvent = 'open' | 'close' | 'change' | 'select' | 'clear' | 'navigate' | 'error';

interface DatePickerState {
    viewDate: Date;
    viewMonth: number;
    viewYear: number;
    selectedDates: Date[];
    mode: DateMode;
    calendar: CalendarType;
    isOpen: boolean;
    showTime: boolean;
    timeFormat: '12h' | '24h';
    theme: Theme;
    firstDayOfWeek: number;
    locale: string;
    minDate: Date | null;
    maxDate: Date | null;
    disabledDates: Set<string>;
    disabledDateFn: ((d: Date) => boolean) | null;
    format: string;
    inline: boolean;
    placeholder: string;
    zIndex: number;
}
declare class StateManager {
    private state;
    constructor(initial?: Partial<DatePickerState>);
    getState(): DatePickerState;
    setState(partial: Partial<DatePickerState>): void;
    setViewDate(date: Date): void;
    setSelectedDates(dates: Date[]): void;
    setMode(mode: DateMode): void;
    setCalendar(calendar: CalendarType): void;
    setIsOpen(open: boolean): void;
    setTheme(theme: Theme): void;
    setLocale(locale: string): void;
    setFirstDayOfWeek(day: number): void;
    setMinDate(date: Date | null): void;
    setMaxDate(date: Date | null): void;
    setDisabledDates(dates: Set<string>, fn: ((d: Date) => boolean) | null): void;
    setFormat(format: string): void;
    setShowTime(show: boolean): void;
    setTimeFormat(format: '12h' | '24h'): void;
    setInline(inline: boolean): void;
    setPlaceholder(placeholder: string): void;
    setZIndex(z: number): void;
}

interface DatePickerElementOptions {
    trigger?: HTMLElement | null;
    container?: HTMLElement | null;
}
declare class DatePicker {
    private state;
    private emitter;
    private locale;
    private injectedLocale?;
    private element;
    private root;
    private input;
    private popup;
    private grid;
    private header;
    private footer;
    private monthLabel;
    private activeTrigger;
    constructor(element?: HTMLElement | null, options?: DatePickerOptions, elementOptions?: DatePickerElementOptions);
    private normalizeStateOptions;
    private parseValue;
    attachTo(element: HTMLElement, options?: DatePickerOptions): void;
    private createRoot;
    private render;
    private renderCalendar;
    private formatMonthLabel;
    private isDayInRange;
    private isRangeStart;
    private isRangeEnd;
    private handleDayClick;
    private selectSingle;
    private selectMultiple;
    private selectRange;
    private handleDayKeydown;
    private navigate;
    private navigateMonth;
    private focusDay;
    private bindEvents;
    private handleOutsideClick;
    private handleDocumentKeydown;
    private attachAccessibility;
    private updateInputAria;
    open(): void;
    close(): void;
    toggle(): void;
    destroy(): void;
    getValue(): string | string[] | null;
    setValue(value: string | string[]): void;
    clear(): void;
    setLocale(code: string): void;
    on(event: string, cb: (payload: any) => void): () => void;
    emit(event: string, payload: any): void;
    update(options: Partial<DatePickerOptions>): void;
    getState(): DatePickerState;
    private isOpen;
    private formatValue;
    private goToToday;
}

type EventHandler = (payload: any) => void;
declare class EventEmitter {
    private events;
    on(event: string, handler: EventHandler): () => void;
    off(event: string, handler: EventHandler): void;
    emit(event: string, payload: any): void;
    destroy(): void;
}

declare function getLocale(code: string): LocaleConfig;
declare function mergeLocale(base: LocaleConfig, overrides?: Partial<LocaleConfig>): LocaleConfig;
declare function getCalendarForLocale(locale: LocaleConfig): CalendarType;
declare function getFirstDayOfWeek$1(locale: LocaleConfig): FirstDayOfWeek;

declare const i18n_getCalendarForLocale: typeof getCalendarForLocale;
declare const i18n_getLocale: typeof getLocale;
declare const i18n_mergeLocale: typeof mergeLocale;
declare namespace i18n {
  export { i18n_getCalendarForLocale as getCalendarForLocale, getFirstDayOfWeek$1 as getFirstDayOfWeek, i18n_getLocale as getLocale, i18n_mergeLocale as mergeLocale };
}

interface CalendarDay {
    year: number;
    month: number;
    day: number;
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    dayOfWeek: number;
}
interface CalendarMonth {
    year: number;
    month: number;
    calendar: CalendarType;
    weeks: CalendarWeek[];
    firstDayOfMonth: CalendarDay;
}
interface CalendarWeek {
    days: CalendarDay[];
}
interface DateLimits {
    minDate: Date | null;
    maxDate: Date | null;
    disabledDates: ReadonlySet<string>;
    disabledDateFn: ((d: Date) => boolean) | null;
}
declare function isToday(date: Date): boolean;
declare function toISOProperties(date: Date): {
    year: number;
    month: number;
    day: number;
};
declare function ISOFromDate(date: Date): string;
declare function toCalendarComponents(date: Date, calendar: CalendarType): {
    year: number;
    month: number;
    day: number;
} | null;
declare function fromCalendarComponents(year: number, month: number, day: number, calendar: CalendarType): Date | null;
declare function getDaysInMonth(year: number, month: number, calendar: CalendarType): number;
declare function getFirstDayOfWeek(year: number, month: number, firstDayOfWeek: FirstDayOfWeek, calendar: CalendarType): CalendarDay;
declare function buildCalendarMonth(year: number, month: number, firstDayOfWeek: FirstDayOfWeek, calendar: CalendarType, _limits: DateLimits): CalendarMonth;
declare function isDateDisabled(date: Date, limits: DateLimits): boolean;
declare function dateEquals(a: Date, b: Date): boolean;
declare function parseDateValue(value: string, calendar?: CalendarType): Date | null;
declare function filterSelectedDates(selected: Date[], _mode: DateMode, max: number): Date[];

type engine_CalendarDay = CalendarDay;
type engine_CalendarMonth = CalendarMonth;
type engine_CalendarWeek = CalendarWeek;
type engine_DateLimits = DateLimits;
declare const engine_ISOFromDate: typeof ISOFromDate;
declare const engine_buildCalendarMonth: typeof buildCalendarMonth;
declare const engine_dateEquals: typeof dateEquals;
declare const engine_filterSelectedDates: typeof filterSelectedDates;
declare const engine_fromCalendarComponents: typeof fromCalendarComponents;
declare const engine_getDaysInMonth: typeof getDaysInMonth;
declare const engine_getFirstDayOfWeek: typeof getFirstDayOfWeek;
declare const engine_isDateDisabled: typeof isDateDisabled;
declare const engine_isToday: typeof isToday;
declare const engine_parseDateValue: typeof parseDateValue;
declare const engine_toCalendarComponents: typeof toCalendarComponents;
declare const engine_toISOProperties: typeof toISOProperties;
declare namespace engine {
  export { type engine_CalendarDay as CalendarDay, type engine_CalendarMonth as CalendarMonth, type engine_CalendarWeek as CalendarWeek, type engine_DateLimits as DateLimits, engine_ISOFromDate as ISOFromDate, engine_buildCalendarMonth as buildCalendarMonth, engine_dateEquals as dateEquals, engine_filterSelectedDates as filterSelectedDates, engine_fromCalendarComponents as fromCalendarComponents, engine_getDaysInMonth as getDaysInMonth, engine_getFirstDayOfWeek as getFirstDayOfWeek, engine_isDateDisabled as isDateDisabled, engine_isToday as isToday, engine_parseDateValue as parseDateValue, engine_toCalendarComponents as toCalendarComponents, engine_toISOProperties as toISOProperties };
}

interface ButtonOptions {
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    className?: string;
    text?: string;
    title?: string;
    'aria-label'?: string;
    'aria-pressed'?: boolean;
    'aria-expanded'?: boolean;
    'aria-selected'?: boolean;
    'aria-live'?: string;
    'aria-hidden'?: boolean;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
    'aria-disabled'?: boolean;
    'data-testid'?: string;
    role?: string;
    tabIndex?: number;
    onClick?: () => void;
}
interface InputOptions {
    type?: 'text' | 'date' | 'time' | 'datetime-local';
    className?: string;
    value?: string;
    placeholder?: string;
    name?: string;
    id?: string;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    'aria-label'?: string;
    'aria-describedby'?: string;
    'aria-expanded'?: boolean;
    'aria-autocomplete'?: string;
    'aria-invalid'?: boolean;
    'aria-live'?: string;
    'aria-hidden'?: boolean;
    'data-testid'?: string;
    role?: string;
    tabIndex?: number;
    min?: string;
    max?: string;
    step?: string;
}
interface CalendarDayOptions {
    year: number;
    month: number;
    day: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    isDisabled: boolean;
    isInRange: boolean;
    isRangeStart: boolean;
    isRangeEnd: boolean;
    inMonthLabel?: string;
}
interface PopupOptions {
    id: string;
    class?: string;
    style?: Partial<CSSStyleDeclaration>;
}
interface DialogOptions {
    id: string;
    class?: string;
    role?: string;
    ariaLabelledby?: string;
    ariaDescribedby?: string;
    ariaModal?: boolean;
    style?: Partial<CSSStyleDeclaration>;
}
type AttrValue = boolean | number | string | null | undefined;
declare function createElement<K extends keyof HTMLElementEventMap>(tag: string, options?: {
    className?: string;
    text?: string;
    id?: string;
    style?: Partial<CSSStyleDeclaration>;
    events?: {
        [P in K]?: (this: HTMLElement, ev: HTMLElementEventMap[K]) => void;
    };
    dataset?: Record<string, string>;
    attributes?: Record<string, AttrValue>;
}): HTMLElement;
declare function createButton(options?: ButtonOptions): HTMLButtonElement;
declare function createInput(options?: InputOptions): HTMLInputElement;
declare function createLabel(text: string, htmlFor?: string, className?: string): HTMLLabelElement;
declare function createCalendarDay(options: CalendarDayOptions): HTMLElement;
declare function createDayGrid(month: {
    weeks: Array<{
        days: Array<{
            year: number;
            month: number;
            day: number;
            date: Date;
            isCurrentMonth: boolean;
            isToday: boolean;
            dayOfWeek: number;
        }>;
    }>;
    firstDayOfMonth: {
        year: number;
        month: number;
        day: number;
        date: Date;
        isCurrentMonth: boolean;
        isToday: boolean;
        dayOfWeek: number;
    };
}): HTMLDivElement;
declare function createPopup(options: PopupOptions): HTMLDivElement;
declare function createDialog(options: DialogOptions): HTMLDivElement;
declare function createHeader(monthLabel: string, yearLabel: string, prevLabel: string, nextLabel: string, className?: string): HTMLDivElement;
declare function createFooter(todayLabel: string, clearLabel: string, okLabel: string, cancelLabel: string, className?: string): HTMLDivElement;
declare function removeNode(node: Node): void;
declare function clearChildren(node: HTMLElement): void;
declare function setAriaLabel(element: HTMLElement, label: string): void;

type dom_ButtonOptions = ButtonOptions;
type dom_CalendarDayOptions = CalendarDayOptions;
type dom_DialogOptions = DialogOptions;
type dom_InputOptions = InputOptions;
type dom_PopupOptions = PopupOptions;
declare const dom_clearChildren: typeof clearChildren;
declare const dom_createButton: typeof createButton;
declare const dom_createCalendarDay: typeof createCalendarDay;
declare const dom_createDayGrid: typeof createDayGrid;
declare const dom_createDialog: typeof createDialog;
declare const dom_createElement: typeof createElement;
declare const dom_createFooter: typeof createFooter;
declare const dom_createHeader: typeof createHeader;
declare const dom_createInput: typeof createInput;
declare const dom_createLabel: typeof createLabel;
declare const dom_createPopup: typeof createPopup;
declare const dom_removeNode: typeof removeNode;
declare const dom_setAriaLabel: typeof setAriaLabel;
declare namespace dom {
  export { type dom_ButtonOptions as ButtonOptions, type dom_CalendarDayOptions as CalendarDayOptions, type dom_DialogOptions as DialogOptions, type dom_InputOptions as InputOptions, type dom_PopupOptions as PopupOptions, dom_clearChildren as clearChildren, dom_createButton as createButton, dom_createCalendarDay as createCalendarDay, dom_createDayGrid as createDayGrid, dom_createDialog as createDialog, dom_createElement as createElement, dom_createFooter as createFooter, dom_createHeader as createHeader, dom_createInput as createInput, dom_createLabel as createLabel, dom_createPopup as createPopup, dom_removeNode as removeNode, dom_setAriaLabel as setAriaLabel };
}

declare const VERSION = "1.0.0";
declare function createDatePicker(element?: HTMLElement | null, options?: DatePickerOptions, elementOptions?: {
    trigger?: HTMLElement | null;
    container?: HTMLElement | null;
}): DatePicker;

export { type CalendarCell, type CalendarType, type DateMode, DatePicker, type DatePickerEvent, type DatePickerInstance, type DatePickerOptions, type DatePickerState, EventEmitter, type FirstDayOfWeek, type LocaleConfig, StateManager, type Theme, type TimeFormat, VERSION, createDatePicker, dom, engine, i18n };
