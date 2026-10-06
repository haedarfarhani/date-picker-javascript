import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  type MutableRefObject,
} from 'react';
import { DatePicker as DatePickerCore } from 'my-datepicker-core';
import type { DatePickerOptions, DatePickerInstance } from 'my-datepicker-core';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DatePickerHandle {
  open(): void;
  close(): void;
  toggle(): void;
  getValue(): string | string[] | null;
  setValue(v: string | string[]): void;
  clear(): void;
  setLocale(l: string): void;
}

export interface DatePickerProps extends Omit<DatePickerOptions, 'value'> {
  /** Controlled value (ISO string or array of ISO strings). */
  value?: string | string[];
  /** Called when the user selects/changes a date. */
  onChange?: (value: string | string[] | null) => void;
  /** Called when the picker opens. */
  onOpen?: () => void;
  /** Called when the picker closes. */
  onClose?: () => void;
  /** Called when the user clears the selection. */
  onClear?: () => void;
  /** Additional className for the container div. */
  className?: string;
  /** Inline styles for the container div. */
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a DatePickerOptions object from React props. */
function mapPropsToOptions(props: DatePickerProps): Partial<DatePickerOptions> {
  const {
    onChange: _onChange,
    onOpen: _onOpen,
    onClose: _onClose,
    onClear: _onClear,
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
 *
 * Design principles:
 * - The core `DatePicker` instance is created once in `useEffect` and kept
 *   in a ref — React never re-renders the inner DOM, the core manages it.
 * - When controlled props change (value, locale, mode …) we call
 *   `instance.update()` instead of re-mounting.
 * - Exposes imperative methods via `forwardRef` + `useImperativeHandle`.
 */
const DatePickerComponent = forwardRef<DatePickerHandle, DatePickerProps>(
  function DatePicker(props, ref) {
    const {
      value,
      onChange,
      onOpen,
      onClose,
      onClear,
      className,
      style,
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);
    const instanceRef = useRef<DatePickerInstance | null>(null);

    // Store stable callback refs so the event listeners don't need re-binding
    const onChangeRef = useRef(onChange);
    const onOpenRef = useRef(onOpen);
    const onCloseRef = useRef(onClose);
    const onClearRef = useRef(onClear);

    useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
    useEffect(() => { onOpenRef.current = onOpen; }, [onOpen]);
    useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
    useEffect(() => { onClearRef.current = onClear; }, [onClear]);

    // ---- Mount / Unmount ----
    useEffect(() => {
      if (!containerRef.current) return;

      const instance = new DatePickerCore(
        containerRef.current,
        mapPropsToOptions(props)
      );

      // Wire up event callbacks
      instance.on('change', (payload) => onChangeRef.current?.(payload.value));
      instance.on('open', () => onOpenRef.current?.());
      instance.on('close', () => onCloseRef.current?.());
      instance.on('clear', () => onClearRef.current?.());

      instanceRef.current = instance;

      return () => {
        instance.destroy();
        instanceRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // intentionally only on mount

    // ---- Sync controlled value ----
    const prevValueRef = useRef<string | string[] | undefined>(value);
    useEffect(() => {
      if (!instanceRef.current) return;
      const prev = prevValueRef.current;
      prevValueRef.current = value;

      const changed =
        JSON.stringify(prev) !== JSON.stringify(value);

      if (!changed) return;

      if (value !== undefined && value !== null) {
        instanceRef.current.setValue(value);
      } else {
        instanceRef.current.clear();
      }
    }, [value]);

    // ---- Sync other option changes ----
    const {
      mode, locale, calendar, minDate, maxDate,
      disabledDates, firstDayOfWeek, theme, inline,
      format, showTime, timeFormat, placeholder, zIndex,
    } = props;

    useEffect(() => {
      if (!instanceRef.current) return;
      instanceRef.current.update(mapPropsToOptions(props));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      mode, locale, calendar, minDate, maxDate,
      disabledDates, firstDayOfWeek, theme, inline,
      format, showTime, timeFormat, placeholder, zIndex,
    ]);

    // ---- Imperative handle ----
    useImperativeHandle(ref, () => ({
      open: () => instanceRef.current?.open(),
      close: () => instanceRef.current?.close(),
      toggle: () => instanceRef.current?.toggle(),
      getValue: () => instanceRef.current?.getValue() ?? null,
      setValue: (v) => instanceRef.current?.setValue(v),
      clear: () => instanceRef.current?.clear(),
      setLocale: (l) => instanceRef.current?.setLocale(l),
    }));

    return <div ref={containerRef} className={className} style={style} />;
  }
);

DatePickerComponent.displayName = 'DatePicker';

export { DatePickerComponent as DatePicker };
