/**
 * Svelte action & wrapper pattern for my-datepicker.
 *
 * Usage:
 *   <div use:datePickerAction={options} on:dpchange={(e) => value = e.detail} />
 */

import { DatePicker as DatePickerCore } from '../DatePicker';
import type { DatePickerOptions, DatePickerInstance } from '../types';

export function datePickerAction(node: HTMLElement, options: Partial<DatePickerOptions> = {}) {
  let instance: DatePickerInstance = new DatePickerCore(node, options);

  instance.on('change', (payload) => {
    node.dispatchEvent(new CustomEvent('dpchange', { detail: payload }));
  });
  instance.on('select', (payload) => {
    node.dispatchEvent(new CustomEvent('dpselect', { detail: payload }));
  });
  instance.on('open', () => {
    node.dispatchEvent(new CustomEvent('dpopen'));
  });
  instance.on('close', () => {
    node.dispatchEvent(new CustomEvent('dpclose'));
  });

  return {
    update(newOptions: Partial<DatePickerOptions>) {
      instance.update(newOptions);
    },
    destroy() {
      instance.destroy();
    },
    getInstance() {
      return instance;
    },
  };
}
