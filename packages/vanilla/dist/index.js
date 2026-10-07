import { DatePicker } from 'my-datepicker-core';
export { DEFAULT_PATTERNS, DatePicker, InvalidDateFormatError, SmartDate, SmartDateFormat, normalizeDigits, toGregorian, toHijri, toJalali } from 'my-datepicker-core';

// src/index.ts
function registerJQueryPlugin() {
  const $ = typeof window !== "undefined" && (window.jQuery || window.$);
  if (!$ || !$.fn) return;
  $.fn.datePicker = function datePicker(options = {}) {
    const instances = [];
    for (let i = 0; i < this.length; i++) {
      instances.push(new DatePicker(this[i], options));
    }
    return instances.length === 1 ? instances[0] : instances;
  };
}
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", registerJQueryPlugin);
  } else {
    registerJQueryPlugin();
  }
}
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map