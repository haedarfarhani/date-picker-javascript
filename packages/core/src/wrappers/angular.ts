/**
 * Angular wrapper pattern for my-datepicker.
 *
 * Standalone Component + ControlValueAccessor compatible with Reactive Forms.
 */

import { DatePicker as DatePickerCore } from '../DatePicker';
import type { DatePickerOptions, DatePickerInstance, CalendarType } from '../types';

export interface ControlValueAccessor {
  writeValue(obj: any): void;
  registerOnChange(fn: any): void;
  registerOnTouched(fn: any): void;
  setDisabledState?(isDisabled: boolean): void;
}

export class AngularDatePickerAdapter implements ControlValueAccessor {
  private instance: DatePickerInstance | null = null;
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private container: HTMLElement, private options: Partial<DatePickerOptions> = {}) {
    this.init();
  }

  private init(): void {
    this.instance = new DatePickerCore(this.container, this.options);
    this.instance.on('change', (payload) => {
      this.onChange(payload.value);
    });
    this.instance.on('close', () => {
      this.onTouched();
    });
  }

  writeValue(val: any): void {
    if (val !== undefined && val !== null) {
      this.instance?.setValue(val);
    } else {
      this.instance?.clear();
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  destroy(): void {
    this.instance?.destroy();
    this.instance = null;
  }

  switchCalendar(cal: CalendarType): void {
    this.instance?.switchCalendar(cal);
  }
}
