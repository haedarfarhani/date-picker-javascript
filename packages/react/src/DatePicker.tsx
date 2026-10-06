import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { DatePicker as DatePickerCore } from 'my-datepicker-core';
import type { DatePickerOptions, DatePickerInstance, CalendarType } from 'my-datepicker-core';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DatePickerHandle {
  open(): void;
  close(): void;
  toggle(): void;
  getValue(): string | string[] | null;
  getSmartDate(): any | any[] | null;
  setValue(v: any): void;
  clear(): void;
  setLocale(l: string): void;
  switchCalendar(c: CalendarType): void;
}

export interface DatePickerProps extends Omit<DatePickerOptions, 'value'> {
  /** Controlled value (ISO string, array, or SmartDate). */
  value?: any;
  /** Called when the user selects/changes a date. */
  onChange?: (value: any, smartDate?: any) => void;
  /** Called when the picker opens. */
  onOpen?: () => void;
  /** Called when the picker closes. */
  onClose?: () => void;
  /** Called when the user clears the selection. */
  onClear?: () => void;
  /** Called on calendar switch. */
  onCalendarChange?: (calendar: CalendarType) => void;
  /** Additional className for the container div. */
  className?: string;
  /** Inline styles for the container div. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapPropsToOptions(props: DatePickerProps): Partial<DatePickerOptions> {
  const {
    onChange: _onChange,
    onOpen: _onOpen,
    onClose: _onClose,
    onClear: _onClear,
    onCalendarChange: _onCalendarChange,
    className: _className,
    style: _style,
    ...rest
  } = props;
  return rest;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * React wrapper for my-datepicker-core.
 */
const DatePickerComponent = forwardRef<DatePickerHandle, DatePickerProps>(
  function DatePicker(props, ref) {
    const {
      value,
      onChange,
      onOpen,
      onClose,
      onClear,
      onCalendarChange,
      className,
      style,
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);
    const instanceRef = useRef<DatePickerInstance | null>(null);

    const onChangeRef = useRef(onChange);
    const onOpenRef = useRef(onOpen);
    const onCloseRef = useRef(onClose);
    const onClearRef = useRef(onClear);
    const onCalendarChangeRef = useRef(onCalendarChange);

    useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
    useEffect(() => { onOpenRef.current = onOpen; }, [onOpen]);
    useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
    useEffect(() => { onClearRef.current = onClear; }, [onClear]);
    useEffect(() => { onCalendarChangeRef.current = onCalendarChange; }, [onCalendarChange]);

    // ---- Mount / Unmount ----
    useEffect(() => {
      if (!containerRef.current) return;

      const instance = new DatePickerCore(
        containerRef.current,
        mapPropsToOptions(props)
      );

      instance.on('change', (payload) => onChangeRef.current?.(payload.value, payload.smartDate));
      instance.on('open', () => onOpenRef.current?.());
      instance.on('close', () => onCloseRef.current?.());
      instance.on('clear', () => onClearRef.current?.());
      instance.on('calendar-change', (payload) => onCalendarChangeRef.current?.(payload.calendar));

      instanceRef.current = instance;

      return () => {
        instance.destroy();
        instanceRef.current = null;
      };
    }, []);

    // ---- Sync controlled value ----
    const prevValueRef = useRef<any>(value);
    useEffect(() => {
      if (!instanceRef.current) return;
      const prev = prevValueRef.current;
      prevValueRef.current = value;

      const changed = JSON.stringify(prev) !== JSON.stringify(value);
      if (!changed) return;

      if (value !== undefined && value !== null) {
        instanceRef.current.setValue(value);
      } else {
        instanceRef.current.clear();
      }
    }, [value]);

    // ---- Sync options ----
    const {
      mode, locale, calendar, minDate, maxDate,
      disabledDates, firstDayOfWeek, theme, design, layout, inline,
      format, pattern, showTime, timeFormat, placeholder, zIndex,
      calendarSwitcher, numeralSystem, hijriAdjustment, hijriPreset,
    } = props;

    useEffect(() => {
      if (!instanceRef.current) return;
      instanceRef.current.update(mapPropsToOptions(props));
    }, [
      mode, locale, calendar, minDate, maxDate,
      disabledDates, firstDayOfWeek, theme, design, layout, inline,
      format, pattern, showTime, timeFormat, placeholder, zIndex,
      calendarSwitcher, numeralSystem, hijriAdjustment, hijriPreset,
    ]);

    // ---- Imperative handle ----
    useImperativeHandle(ref, () => ({
      open: () => instanceRef.current?.open(),
      close: () => instanceRef.current?.close(),
      toggle: () => instanceRef.current?.toggle(),
      getValue: () => instanceRef.current?.getValue() ?? null,
      getSmartDate: () => instanceRef.current?.getSmartDate() ?? null,
      setValue: (v) => instanceRef.current?.setValue(v),
      clear: () => instanceRef.current?.clear(),
      setLocale: (l) => instanceRef.current?.setLocale(l),
      switchCalendar: (c) => instanceRef.current?.switchCalendar(c),
    }));

    return <div ref={containerRef} className={className} style={style} />;
  }
);

DatePickerComponent.displayName = 'DatePicker';

export { DatePickerComponent as DatePicker };
