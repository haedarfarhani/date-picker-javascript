'use strict';

var myDatepickerCore = require('my-datepicker-core');

// src/index.ts
function registerJQueryPlugin() {
  const $ = typeof window !== "undefined" && (window.jQuery || window.$);
  if (!$ || !$.fn) return;
  $.fn.datePicker = function datePicker(options = {}) {
    const instances = [];
    for (let i = 0; i < this.length; i++) {
      instances.push(new myDatepickerCore.DatePicker(this[i], options));
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

Object.defineProperty(exports, "DEFAULT_PATTERNS", {
  enumerable: true,
  get: function () { return myDatepickerCore.DEFAULT_PATTERNS; }
});
Object.defineProperty(exports, "DatePicker", {
  enumerable: true,
  get: function () { return myDatepickerCore.DatePicker; }
});
Object.defineProperty(exports, "InvalidDateFormatError", {
  enumerable: true,
  get: function () { return myDatepickerCore.InvalidDateFormatError; }
});
Object.defineProperty(exports, "SmartDate", {
  enumerable: true,
  get: function () { return myDatepickerCore.SmartDate; }
});
Object.defineProperty(exports, "SmartDateFormat", {
  enumerable: true,
  get: function () { return myDatepickerCore.SmartDateFormat; }
});
Object.defineProperty(exports, "normalizeDigits", {
  enumerable: true,
  get: function () { return myDatepickerCore.normalizeDigits; }
});
Object.defineProperty(exports, "toGregorian", {
  enumerable: true,
  get: function () { return myDatepickerCore.toGregorian; }
});
Object.defineProperty(exports, "toHijri", {
  enumerable: true,
  get: function () { return myDatepickerCore.toHijri; }
});
Object.defineProperty(exports, "toJalali", {
  enumerable: true,
  get: function () { return myDatepickerCore.toJalali; }
});
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map