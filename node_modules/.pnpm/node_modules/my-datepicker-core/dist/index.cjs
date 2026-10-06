"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  DatePicker: () => DatePicker,
  EventEmitter: () => EventEmitter,
  StateManager: () => StateManager,
  VERSION: () => VERSION,
  createDatePicker: () => createDatePicker,
  dom: () => dom_exports,
  engine: () => engine_exports,
  i18n: () => i18n_exports
});
module.exports = __toCommonJS(index_exports);

// src/state.ts
var StateManager = class {
  constructor(initial = {}) {
    this.state = {
      viewDate: initial.viewDate || /* @__PURE__ */ new Date(),
      viewMonth: initial.viewMonth ?? (/* @__PURE__ */ new Date()).getMonth(),
      viewYear: initial.viewYear ?? (/* @__PURE__ */ new Date()).getFullYear(),
      selectedDates: initial.selectedDates || [],
      mode: initial.mode || "single",
      calendar: initial.calendar || "gregorian",
      isOpen: initial.isOpen || false,
      showTime: initial.showTime || false,
      timeFormat: initial.timeFormat || "24h",
      theme: initial.theme || "light",
      firstDayOfWeek: initial.firstDayOfWeek ?? 0,
      locale: initial.locale || "en-US",
      minDate: initial.minDate || null,
      maxDate: initial.maxDate || null,
      disabledDates: initial.disabledDates || /* @__PURE__ */ new Set(),
      disabledDateFn: initial.disabledDateFn || null,
      format: initial.format || "YYYY-MM-DD",
      inline: initial.inline || false,
      placeholder: initial.placeholder || "Select date",
      zIndex: initial.zIndex || 1e3
    };
  }
  getState() {
    return { ...this.state };
  }
  setState(partial) {
    this.state = { ...this.state, ...partial };
  }
  setViewDate(date) {
    this.state.viewDate = date;
    this.state.viewMonth = date.getMonth();
    this.state.viewYear = date.getFullYear();
  }
  setSelectedDates(dates) {
    this.state.selectedDates = dates;
  }
  setMode(mode) {
    this.state.mode = mode;
  }
  setCalendar(calendar) {
    this.state.calendar = calendar;
  }
  setIsOpen(open) {
    this.state.isOpen = open;
  }
  setTheme(theme) {
    this.state.theme = theme;
  }
  setLocale(locale) {
    this.state.locale = locale;
  }
  setFirstDayOfWeek(day) {
    this.state.firstDayOfWeek = day;
  }
  setMinDate(date) {
    this.state.minDate = date;
  }
  setMaxDate(date) {
    this.state.maxDate = date;
  }
  setDisabledDates(dates, fn) {
    this.state.disabledDates = dates;
    this.state.disabledDateFn = fn;
  }
  setFormat(format) {
    this.state.format = format;
  }
  setShowTime(show) {
    this.state.showTime = show;
  }
  setTimeFormat(format) {
    this.state.timeFormat = format;
  }
  setInline(inline) {
    this.state.inline = inline;
  }
  setPlaceholder(placeholder) {
    this.state.placeholder = placeholder;
  }
  setZIndex(z) {
    this.state.zIndex = z;
  }
};

// src/events.ts
var EventEmitter = class {
  constructor() {
    this.events = /* @__PURE__ */ new Map();
  }
  on(event, handler) {
    if (!this.events.has(event)) {
      this.events.set(event, /* @__PURE__ */ new Set());
    }
    this.events.get(event).add(handler);
    return () => this.off(event, handler);
  }
  off(event, handler) {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.events.delete(event);
      }
    }
  }
  emit(event, payload) {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Error in event handler for "${event}":`, error);
        }
      });
    }
  }
  destroy() {
    this.events.clear();
  }
};

// src/i18n.ts
var i18n_exports = {};
__export(i18n_exports, {
  getCalendarForLocale: () => getCalendarForLocale,
  getFirstDayOfWeek: () => getFirstDayOfWeek,
  getLocale: () => getLocale,
  mergeLocale: () => mergeLocale
});
var LOCALES = {
  "en-US": {
    code: "en-US",
    direction: "ltr",
    days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    months: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ],
    firstDay: 0,
    today: "Today",
    select: "Select",
    clear: "Clear",
    cancel: "Cancel",
    ok: "OK",
    placeholder: "Select date",
    rangeSeparator: " to ",
    startDate: "Start date",
    endDate: "End date",
    week: "Wk",
    weekDay: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    month: "Month",
    year: "Year",
    calendar: "gregorian",
    navPrev: "\u2039",
    navNext: "\u203A"
  },
  "fa-IR": {
    code: "fa-IR",
    direction: "rtl",
    days: ["\u06CC\u06A9", "\u062F\u0648", "\u0633\u0647", "\u0686\u0647\u0627\u0631", "\u067E\u0646\u062C", "\u0634\u0646\u0628\u0647", "\u06CC\u06A9"],
    months: [
      "\u0641\u0631\u0648\u0631\u062F\u06CC\u0646",
      "\u0627\u0631\u062F\u06CC\u0628\u0647\u0634\u062A",
      "\u062E\u0631\u062F\u0627\u062F",
      "\u062A\u06CC\u0631",
      "\u0645\u0631\u062F\u0627\u062F",
      "\u0634\u0647\u0631\u06CC\u0648\u0631",
      "\u0645\u0647\u0631",
      "\u0622\u0628\u0627\u0646",
      "\u0622\u0630\u0631",
      "\u062F\u06CC",
      "\u0628\u0647\u0645\u0646",
      "\u0627\u0633\u0641"
    ],
    firstDay: 6,
    today: "\u0627\u0645\u0631\u0648\u0632",
    select: "\u0627\u0646\u062A\u062E\u0627\u0628",
    clear: "\u067E\u0627\u06A9 \u06A9\u0631\u062F\u0646",
    cancel: "\u0644\u063A\u0648",
    ok: "\u062A\u0627\u06CC\u06CC\u062F",
    placeholder: "\u062A\u0627\u0631\u06CC\u062E \u0631\u0627 \u0627\u0646\u062A\u062E\u0627\u0628 \u06A9\u0646\u06CC\u062F",
    rangeSeparator: " \u062A\u0627 ",
    startDate: "\u062A\u0627\u0631\u06CC\u062E \u0634\u0631\u0648\u0639",
    endDate: "\u062A\u0627\u0631\u06CC\u062E \u067E\u0627\u06CC\u0627\u0646",
    week: "\u0647\u0641\u062A\u0647",
    weekDay: ["\u0634", "\u06CC", "\u062F", "\u0633", "\u0686", "\u067E", "\u062C"],
    month: "\u0645\u0627\u0647",
    year: "\u0633\u0627\u0644",
    calendar: "jalali",
    navPrev: "\u2039",
    navNext: "\u203A"
  },
  "ar-SA": {
    code: "ar-SA",
    direction: "rtl",
    days: ["\u0627\u0644\u0623\u062D\u062F", "\u0627\u0644\u0625\u062B\u0646\u064A\u0646", "\u0627\u0644\u062B\u0644\u0627\u062B\u0627\u0621", "\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621", "\u0627\u0644\u062E\u0645\u064A\u0633", "\u0627\u0644\u062C\u0645\u0639\u0629", "\u0627\u0644\u0633\u0628\u062A"],
    months: [
      "\u064A\u0646\u0627\u064A\u0631",
      "\u0641\u0628\u0631\u0627\u064A\u0631",
      "\u0645\u0627\u0631\u0633",
      "\u0623\u0628\u0631\u064A\u0644",
      "\u0645\u0627\u064A\u0648",
      "\u064A\u0648\u0646\u064A\u0648",
      "\u064A\u0648\u0644\u064A\u0648",
      "\u0623\u063A\u0633\u0637\u0633",
      "\u0633\u0628\u062A\u0645\u0628\u0631",
      "\u0623\u0643\u062A\u0648\u0628\u0631",
      "\u0646\u0648\u0641\u0645\u0628\u0631",
      "\u062F\u064A\u0633\u0645\u0628\u0631"
    ],
    firstDay: 6,
    today: "\u0627\u0644\u064A\u0648\u0645",
    select: "\u0627\u062E\u062A\u064A\u0627\u0631",
    clear: "\u0645\u0633\u062D",
    cancel: "\u0625\u0644\u063A\u0627\u0621",
    ok: "\u0645\u0648\u0627\u0641\u0642",
    placeholder: "\u0627\u062E\u062A\u0631 \u062A\u0627\u0631\u064A\u062E",
    rangeSeparator: " \u0625\u0644\u0649 ",
    startDate: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0628\u062F\u0627\u064A\u0629",
    endDate: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0646\u0647\u0627\u064A\u0629",
    week: "\u0623\u0633\u0628\u0648\u0639",
    weekDay: ["\u0627\u0644\u0623\u062D\u062F", "\u0627\u0644\u0625\u062B\u0646\u064A\u0646", "\u0627\u0644\u062B\u0644\u0627\u062B\u0627\u0621", "\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621", "\u0627\u0644\u062E\u0645\u064A\u0633", "\u0627\u0644\u062C\u0645\u0639\u0629", "\u0627\u0644\u0633\u0628\u062A"],
    month: "\u0634\u0647\u0631",
    year: "\u0633\u0646\u0629",
    calendar: "gregorian",
    navPrev: "\u2039",
    navNext: "\u203A"
  }
};
function getLocale(code) {
  const locale = LOCALES[code];
  if (locale) {
    return locale;
  }
  const parts = code.split("-");
  const base = parts[0];
  if (base === "fa") {
    return LOCALES["fa-IR"];
  }
  if (base === "ar") {
    return LOCALES["ar-SA"];
  }
  return LOCALES["en-US"];
}
function mergeLocale(base, overrides) {
  if (!overrides) return base;
  return { ...base, ...overrides };
}
function getCalendarForLocale(locale) {
  return locale.calendar;
}
function getFirstDayOfWeek(locale) {
  return locale.firstDay;
}

// src/engine.ts
var engine_exports = {};
__export(engine_exports, {
  ISOFromDate: () => ISOFromDate,
  buildCalendarMonth: () => buildCalendarMonth,
  dateEquals: () => dateEquals,
  filterSelectedDates: () => filterSelectedDates,
  fromCalendarComponents: () => fromCalendarComponents,
  getDaysInMonth: () => getDaysInMonth,
  getFirstDayOfWeek: () => getFirstDayOfWeek2,
  isDateDisabled: () => isDateDisabled,
  isToday: () => isToday,
  parseDateValue: () => parseDateValue,
  toCalendarComponents: () => toCalendarComponents,
  toISOProperties: () => toISOProperties
});
var CALENDAR_LOCALE = "fa-IR";
var CALENDAR_MAP = {
  gregorian: { localeTag: "en-US", intlCalendar: "gregory" },
  jalali: { localeTag: CALENDAR_LOCALE, intlCalendar: "persian" },
  hijri: { localeTag: CALENDAR_LOCALE, intlCalendar: "islamic" }
};
function intlOptions(calendar) {
  const cfg = CALENDAR_MAP[calendar];
  return {
    locale: cfg.localeTag,
    calendar: cfg.intlCalendar,
    year: "numeric",
    month: "numeric",
    day: "numeric"
  };
}
function isToday(date) {
  const today = /* @__PURE__ */ new Date();
  return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
}
function toISOProperties(date) {
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate()
  };
}
function ISOFromDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function formatToParts(date, calendar) {
  try {
    const fmt = new Intl.DateTimeFormat(CALENDAR_LOCALE, intlOptions(calendar));
    return fmt.formatToParts(date);
  } catch {
    return [];
  }
}
function toCalendarComponents(date, calendar) {
  try {
    const parts = formatToParts(date, calendar);
    let year = 0;
    let month = 0;
    let day = 0;
    for (const p of parts) {
      if (p.type === "year") year = Number(p.value);
      else if (p.type === "month") month = Number(p.value);
      else if (p.type === "day") day = Number(p.value);
    }
    if (year && month && day) {
      return { year, month: month - 1, day };
    }
    return null;
  } catch {
    return null;
  }
}
function fromCalendarComponents(year, month, day, calendar) {
  try {
    const anchor = new Date(Date.UTC(2e3, 0, 1));
    const anchorParts = toCalendarComponents(anchor, calendar);
    if (!anchorParts) return null;
    const targetTime = Date.UTC(
      anchorParts.year + (year - anchorParts.year),
      anchorParts.month + (month - anchorParts.month),
      anchorParts.day + (day - anchorParts.day)
    );
    const target = new Date(targetTime);
    const targetParts = toCalendarComponents(target, calendar);
    if (!targetParts) return null;
    const adjusted = new Date(
      target.getTime() + (targetParts.year - year) * 31556952e3 + (targetParts.month - month) * 2629746e3 + (targetParts.day - day) * 864e5
    );
    return adjusted;
  } catch {
    return null;
  }
}
function getDaysInMonth(year, month, calendar) {
  try {
    const firstOfMonth = fromCalendarComponents(year, month, 1, calendar);
    if (!firstOfMonth) return 30;
    const firstOfNext = new Date(firstOfMonth);
    firstOfNext.setMonth(firstOfMonth.getMonth() + 1, 0);
    const last = new Date(firstOfNext);
    last.setDate(0);
    const components = toCalendarComponents(last, calendar);
    return components ? components.day : 30;
  } catch {
    return 30;
  }
}
function getFirstDayOfWeek2(year, month, firstDayOfWeek, calendar) {
  const date = fromCalendarComponents(year, month, 1, calendar) ?? new Date(year, month, 1);
  const rawDayOfWeek = date.getDay();
  const shifted = (rawDayOfWeek - firstDayOfWeek + 7) % 7;
  return {
    year,
    month,
    day: 1,
    date,
    isCurrentMonth: true,
    isToday: isToday(date),
    dayOfWeek: shifted
  };
}
function buildCalendarMonth(year, month, firstDayOfWeek, calendar, _limits) {
  const weeks = [];
  const firstDay = getFirstDayOfWeek2(year, month, firstDayOfWeek, calendar);
  const daysInMonth = getDaysInMonth(year, month, calendar);
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const prevDaysInMonth = getDaysInMonth(prevYear, prevMonth, calendar);
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  const week = new Array(7).fill(null);
  let idx = 0;
  for (let i = firstDay.dayOfWeek - 1; i >= 0; i--) {
    const dayNumber = prevDaysInMonth - i;
    const d = fromCalendarComponents(prevYear, prevMonth, dayNumber, calendar);
    week[idx++] = toCalendarDay(
      prevYear,
      prevMonth,
      dayNumber,
      d ?? new Date(prevYear, prevMonth, dayNumber),
      false
    );
  }
  for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber++) {
    const d = fromCalendarComponents(year, month, dayNumber, calendar);
    week[idx++] = toCalendarDay(year, month, dayNumber, d ?? new Date(year, month, dayNumber), true);
    if (idx === 7) {
      weeks.push({ days: week.filter((d2) => d2 !== null) });
      week.fill(null);
      idx = 0;
    }
  }
  while (idx < 7) {
    const dayNumber = idx + 1;
    const d = fromCalendarComponents(nextYear, nextMonth, dayNumber, calendar);
    week[idx++] = toCalendarDay(
      nextYear,
      nextMonth,
      dayNumber,
      d ?? new Date(nextYear, nextMonth, dayNumber),
      false
    );
  }
  if (week.some((d) => d !== null)) {
    weeks.push({ days: week.filter((d) => d !== null) });
  }
  return { year, month, calendar, weeks, firstDayOfMonth: firstDay };
}
function toCalendarDay(year, month, day, date, isCurrentMonth) {
  return {
    year,
    month,
    day,
    date,
    isCurrentMonth,
    isToday: isToday(date),
    dayOfWeek: date.getDay()
  };
}
function isDateDisabled(date, limits) {
  const key = ISOFromDate(date);
  if (limits.disabledDates.has(key)) return true;
  if (limits.disabledDateFn && limits.disabledDateFn(date)) return true;
  if (limits.minDate && date < limits.minDate) return true;
  if (limits.maxDate && date > limits.maxDate) return true;
  return false;
}
function dateEquals(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function parseDateValue(value, calendar) {
  if (!value) return null;
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!isFinite(y) || !isFinite(mo) || !isFinite(d)) return null;
  if (calendar && (calendar === "jalali" || calendar === "hijri")) {
    const result = fromCalendarComponents(y, mo - 1, d, calendar);
    return result ?? null;
  }
  const date = new Date(y, mo - 1, d);
  if (date.getMonth() !== mo - 1 || date.getDate() !== d) return null;
  return date;
}
function filterSelectedDates(selected, _mode, max) {
  if (selected.length <= max) return selected;
  return selected.slice(0, max);
}

// src/dom.ts
var dom_exports = {};
__export(dom_exports, {
  clearChildren: () => clearChildren,
  createButton: () => createButton,
  createCalendarDay: () => createCalendarDay,
  createDayGrid: () => createDayGrid,
  createDialog: () => createDialog,
  createElement: () => createElement,
  createFooter: () => createFooter,
  createHeader: () => createHeader,
  createInput: () => createInput,
  createLabel: () => createLabel,
  createPopup: () => createPopup,
  removeNode: () => removeNode,
  setAriaLabel: () => setAriaLabel
});
function attr(el, name, value) {
  if (value === void 0) return;
  if (value === null) {
    el.removeAttribute(name);
    return;
  }
  if (typeof value === "boolean") {
    if (value) el.setAttribute(name, "");
    else el.removeAttribute(name);
    return;
  }
  el.setAttribute(name, String(value));
}
function createElement(tag, options) {
  const el = document.createElement(tag);
  if (options) {
    if (options.className) el.className = options.className;
    if (options.id) el.id = options.id;
    if (options.text) el.textContent = options.text;
    if (options.style) {
      Object.assign(el.style, options.style);
    }
    if (options.dataset) {
      for (const [key, value] of Object.entries(options.dataset)) {
        el.dataset[key] = value;
      }
    }
    if (options.attributes) {
      for (const [key, value] of Object.entries(options.attributes)) {
        attr(el, key, value);
      }
    }
    if (options.events) {
      for (const [event, handler] of Object.entries(options.events)) {
        el.addEventListener(event, handler);
      }
    }
  }
  return el;
}
function createButton(options = {}) {
  const el = createElement("button", {
    className: options.className || "dp-btn",
    text: options.text || void 0,
    style: {},
    events: options.onClick ? { click: options.onClick } : void 0,
    attributes: {
      type: options.type || "button",
      disabled: options.disabled || false,
      title: options.title || null,
      "aria-label": options["aria-label"] || null,
      "aria-pressed": options["aria-pressed"] ?? null,
      "aria-expanded": options["aria-expanded"] ?? null,
      "aria-selected": options["aria-selected"] ?? null,
      "aria-live": options["aria-live"] || null,
      "aria-hidden": options["aria-hidden"] ?? null,
      "aria-labelledby": options["aria-labelledby"] || null,
      "aria-describedby": options["aria-describedby"] || null,
      "aria-disabled": options["aria-disabled"] ?? null,
      "data-testid": options["data-testid"] || null,
      role: options.role || null,
      tabindex: options.tabIndex ?? null
    }
  });
  if (options.disabled) el.disabled = true;
  return el;
}
function createInput(options = {}) {
  const el = createElement("input", {
    className: options.className || "dp-input",
    text: void 0,
    style: {},
    attributes: {
      type: options.type || "text",
      value: options.value || null,
      placeholder: options.placeholder || null,
      name: options.name || null,
      id: options.id || null,
      disabled: options.disabled || false,
      readonly: options.readOnly || false,
      required: options.required || false,
      "aria-label": options["aria-label"] || null,
      "aria-describedby": options["aria-describedby"] || null,
      "aria-expanded": options["aria-expanded"] ?? null,
      "aria-autocomplete": options["aria-autocomplete"] || null,
      "aria-invalid": options["aria-invalid"] ?? null,
      "aria-live": options["aria-live"] || null,
      "aria-hidden": options["aria-hidden"] ?? null,
      "data-testid": options["data-testid"] || null,
      role: options.role || null,
      tabindex: options.tabIndex ?? 0,
      min: options.min || null,
      max: options.max || null,
      step: options.step || null
    }
  });
  if (options.disabled) el.disabled = true;
  if (options.readOnly) el.readOnly = true;
  return el;
}
function createLabel(text, htmlFor, className) {
  const el = createElement("label", {
    className: className || "dp-label",
    text,
    attributes: { for: htmlFor ?? null }
  });
  return el;
}
function createCalendarDay(options) {
  const el = createButton({
    className: "dp-day dp-day--other-month",
    "aria-label": options.inMonthLabel ? `${options.inMonthLabel}, ${options.day}` : `Day ${options.day}`,
    text: String(options.day),
    "aria-selected": options.isSelected,
    "aria-disabled": options.isDisabled,
    disabled: options.isDisabled,
    "aria-pressed": options.isSelected,
    "data-testid": `dp-day-${options.year}-${options.month + 1}-${options.day}`,
    role: "gridcell",
    onClick: void 0
  });
  if (options.isCurrentMonth) {
    el.classList.remove("dp-day--other-month");
    el.classList.add("dp-day--in-month");
  }
  if (options.isToday) {
    el.classList.add("dp-day--today");
  }
  if (options.isSelected) {
    el.classList.add("dp-day--selected");
  }
  if (options.isRangeStart) {
    el.classList.add("dp-day--range-start");
  }
  if (options.isRangeEnd) {
    el.classList.add("dp-day--range-end");
  }
  if (options.isInRange && !options.isSelected) {
    el.classList.add("dp-day--in-range");
  }
  return el;
}
function createDayGrid(month) {
  const grid = createElement("div", {
    className: "dp-day-grid",
    attributes: { role: "grid", "aria-label": "Calendar days" }
  });
  const caption = createElement("caption", {
    className: "dp-caption",
    text: "",
    attributes: { "aria-hidden": true }
  });
  grid.appendChild(caption);
  for (const week of month.weeks) {
    const row = createElement("div", {
      className: "dp-week",
      attributes: { role: "row" }
    });
    for (const day of week.days) {
      const cell = createCalendarDay({
        year: day.year,
        month: day.month,
        day: day.day,
        isCurrentMonth: day.isCurrentMonth,
        isToday: day.isToday,
        isSelected: false,
        isDisabled: false,
        isInRange: false,
        isRangeStart: false,
        isRangeEnd: false
      });
      row.appendChild(cell);
    }
    grid.appendChild(row);
  }
  return grid;
}
function createPopup(options) {
  const el = createElement("div", {
    className: options.class || "dp-popup",
    style: options.style,
    attributes: {
      id: options.id,
      role: "dialog",
      "aria-modal": true,
      "aria-label": "Date picker dialog",
      tabindex: -1
    }
  });
  return el;
}
function createDialog(options) {
  const el = createElement("div", {
    className: options.class || "dp-dialog",
    style: options.style,
    attributes: {
      id: options.id,
      role: options.role || "dialog",
      "aria-labelledby": options.ariaLabelledby ?? null,
      "aria-describedby": options.ariaDescribedby ?? null,
      "aria-modal": options.ariaModal ? "true" : "false"
    }
  });
  return el;
}
function createHeader(monthLabel, yearLabel, prevLabel, nextLabel, className) {
  const header = createElement("div", {
    className: className || "dp-header",
    attributes: { role: "presentation" }
  });
  const nav = createElement("div", {
    className: "dp-nav",
    attributes: { role: "group", "aria-label": "Navigate months" }
  });
  const prev = createButton({
    className: "dp-nav-prev dp-nav-btn",
    text: prevLabel,
    "aria-label": "Previous month",
    "data-testid": "dp-nav-prev"
  });
  nav.appendChild(prev);
  const label = createElement("div", {
    className: "dp-nav-label",
    text: `${monthLabel} ${yearLabel}`,
    attributes: { role: "status", "aria-live": "off" }
  });
  nav.appendChild(label);
  const next = createButton({
    className: "dp-nav-next dp-nav-btn",
    text: nextLabel,
    "aria-label": "Next month",
    "data-testid": "dp-nav-next"
  });
  nav.appendChild(next);
  header.appendChild(nav);
  return header;
}
function createFooter(todayLabel, clearLabel, okLabel, cancelLabel, className) {
  const footer = createElement("div", {
    className: className || "dp-footer",
    attributes: { role: "group", "aria-label": "Picker actions" }
  });
  const left = createElement("div", {
    className: "dp-footer-left",
    attributes: {}
  });
  const right = createElement("div", {
    className: "dp-footer-right",
    attributes: {}
  });
  const today = createButton({
    className: "dp-footer-btn dp-btn--today",
    text: todayLabel,
    "aria-label": "Go to today",
    "data-testid": "dp-btn-today"
  });
  left.appendChild(today);
  const clear = createButton({
    className: "dp-footer-btn dp-btn--clear",
    text: clearLabel,
    "aria-label": "Clear selection",
    "data-testid": "dp-btn-clear"
  });
  left.appendChild(clear);
  const cancel = createButton({
    className: "dp-footer-btn dp-btn--cancel",
    text: cancelLabel,
    "aria-label": "Cancel",
    "data-testid": "dp-btn-cancel"
  });
  right.appendChild(cancel);
  const ok = createButton({
    className: "dp-footer-btn dp-btn--ok",
    text: okLabel,
    "aria-label": "Confirm selection",
    "data-testid": "dp-btn-ok"
  });
  right.appendChild(ok);
  footer.appendChild(left);
  footer.appendChild(right);
  return footer;
}
function removeNode(node) {
  if (node.parentNode) node.parentNode.removeChild(node);
}
function clearChildren(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}
function setAriaLabel(element, label) {
  element.setAttribute("aria-label", label);
}

// src/DatePicker.ts
var DatePicker = class {
  constructor(element, options, elementOptions) {
    this.root = null;
    this.input = null;
    this.popup = null;
    this.grid = null;
    this.header = null;
    this.footer = null;
    this.monthLabel = null;
    this.activeTrigger = null;
    this.state = new StateManager(this.normalizeStateOptions(options));
    this.emitter = new EventEmitter();
    this.element = elementOptions ?? {};
    this.locale = getLocale(this.state.getState().locale);
    if (options?.locale && typeof options.locale !== "string") {
      this.injectedLocale = options.locale;
      this.locale = mergeLocale(this.locale, options.locale);
    }
    this.state.setLocale(this.locale.code);
    if (element) {
      this.attachTo(element, options);
    } else if (this.element.trigger) {
      this.attachTo(this.element.trigger, options);
    }
  }
  normalizeStateOptions(options) {
    const normalized = {};
    if (options) {
      if (options.mode) normalized.mode = options.mode;
      if (options.value) {
        const parsed = this.parseValue(options.value, options.calendar);
        if (parsed) normalized.selectedDates = parsed;
      }
      if (options.minDate) {
        const min = parseDateValue(options.minDate, options.calendar);
        if (min) normalized.minDate = min;
      }
      if (options.maxDate) {
        const max = parseDateValue(options.maxDate, options.calendar);
        if (max) normalized.maxDate = max;
      }
      if (options.disabledDates) {
        if (Array.isArray(options.disabledDates)) {
          normalized.disabledDates = new Set(options.disabledDates);
        }
      }
      if (options.firstDayOfWeek) normalized.firstDayOfWeek = options.firstDayOfWeek;
      if (options.calendar) normalized.calendar = options.calendar;
      if (options.format) normalized.format = options.format;
      if (options.showTime !== void 0) normalized.showTime = options.showTime;
      if (options.timeFormat) normalized.timeFormat = options.timeFormat;
      if (options.inline !== void 0) normalized.inline = options.inline;
      if (options.placeholder) normalized.placeholder = options.placeholder;
      if (options.theme) normalized.theme = options.theme;
      if (options.zIndex) normalized.zIndex = options.zIndex;
    }
    return normalized;
  }
  parseValue(value, calendar) {
    const list = Array.isArray(value) ? value : [value];
    const parsed = [];
    for (const v of list) {
      const d = parseDateValue(v, calendar);
      if (!d) return null;
      parsed.push(d);
    }
    return parsed;
  }
  attachTo(element, options) {
    this.input = element instanceof HTMLInputElement ? element : null;
    this.root = this.createRoot();
    this.popup = createPopup({ id: `dp-popup-${Math.random().toString(36).slice(2)}` });
    this.popup.classList.add("dp-popup--attached");
    this.root.appendChild(this.popup);
    this.render();
    this.bindEvents();
    this.attachAccessibility();
    if (options) {
      this.update(options);
    }
    if (this.input) {
      this.input.addEventListener("focus", () => this.open());
      this.input.addEventListener("blur", () => {
        setTimeout(() => {
          if (this.popup && !this.popup.contains(document.activeElement)) {
            this.close();
          }
        }, 120);
      });
    }
  }
  createRoot() {
    const root = createElement("div", {
      className: "dp-root",
      attributes: { role: "presentation" }
    });
    return root;
  }
  render() {
    this.popup = createPopup({
      id: this.popup?.id ?? `dp-popup-${Math.random().toString(36).slice(2)}`
    });
    this.popup.classList.add("dp-popup--attached");
    if (this.state.getState().inline) {
      this.popup.classList.add("dp-popup--inline");
    }
    this.popup.style.zIndex = String(this.state.getState().zIndex);
    this.popup.setAttribute("dir", this.locale.direction);
    this.grid = createElement("div", {
      className: "dp-grid",
      attributes: { role: "grid", "aria-label": "Calendar" }
    });
    this.header = createHeader(
      this.locale.month,
      this.locale.year,
      this.locale.navPrev ?? "\u2039",
      this.locale.navNext ?? "\u203A"
    );
    this.footer = createFooter(
      this.locale.today,
      this.locale.clear,
      this.locale.ok,
      this.locale.cancel
    );
    this.popup.replaceChildren(this.header, this.grid, this.footer);
    this.monthLabel = this.header.querySelector(".dp-nav-label");
    this.renderCalendar();
  }
  renderCalendar() {
    if (!this.grid) return;
    clearChildren(this.grid);
    const state = this.state.getState();
    const calendar = state.calendar;
    const firstDay = state.firstDayOfWeek;
    const limits = {
      minDate: state.minDate,
      maxDate: state.maxDate,
      disabledDates: state.disabledDates,
      disabledDateFn: state.disabledDateFn
    };
    const month = buildCalendarMonth(
      state.viewYear,
      state.viewMonth,
      firstDay,
      calendar,
      limits
    );
    for (const week of month.weeks) {
      const row = createElement("div", {
        className: "dp-week",
        attributes: { role: "row" }
      });
      for (const day of week.days) {
        const selected = state.selectedDates.some((d) => dateEquals(d, day.date));
        const inRange = this.isDayInRange(day.date, state.selectedDates);
        const rangeStart = this.isRangeStart(day.date, state.selectedDates);
        const rangeEnd = this.isRangeEnd(day.date, state.selectedDates);
        const disabled = isDateDisabled(day.date, limits);
        const cell = createCalendarDay({
          year: day.year,
          month: day.month,
          day: day.day,
          isCurrentMonth: day.isCurrentMonth,
          isToday: day.isToday,
          isSelected: selected,
          isDisabled: disabled,
          isInRange: inRange && !selected,
          isRangeStart: rangeStart,
          isRangeEnd: rangeEnd,
          inMonthLabel: day.isCurrentMonth ? `${this.locale.weekDay[day.dayOfWeek]}\u060C ${this.locale.days[day.dayOfWeek]}` : ""
        });
        cell.addEventListener("click", () => this.handleDayClick(day.date));
        cell.addEventListener("keydown", (e) => this.handleDayKeydown(e, day));
        cell.tabIndex = selected || day.isToday ? 0 : -1;
        row.appendChild(cell);
      }
      this.grid.appendChild(row);
    }
    if (this.monthLabel) {
      const formatted = this.formatMonthLabel(month.firstDayOfMonth.date);
      this.monthLabel.textContent = formatted;
    }
  }
  formatMonthLabel(date) {
    try {
      const fmt = new Intl.DateTimeFormat(this.locale.code, {
        month: "long",
        year: "numeric",
        calendar: calendarTag(this.state.getState().calendar)
      });
      return fmt.format(date);
    } catch {
      return `${this.locale.month} ${date.getFullYear()}`;
    }
  }
  isDayInRange(day, selected) {
    if (selected.length < 2) return false;
    const min = selected[0] < selected[1] ? selected[0] : selected[1];
    const max = selected[0] < selected[1] ? selected[1] : selected[0];
    return day > min && day < max;
  }
  isRangeStart(day, selected) {
    if (selected.length < 2) return false;
    const min = selected[0] < selected[1] ? selected[0] : selected[1];
    return dateEquals(day, min);
  }
  isRangeEnd(day, selected) {
    if (selected.length < 2) return false;
    const max = selected[0] < selected[1] ? selected[1] : selected[0];
    return dateEquals(day, max);
  }
  handleDayClick(date) {
    const state = this.state.getState();
    const limits = {
      minDate: state.minDate,
      maxDate: state.maxDate,
      disabledDates: state.disabledDates,
      disabledDateFn: state.disabledDateFn
    };
    if (isDateDisabled(date, limits)) return;
    const mode = state.mode;
    if (mode === "single") {
      this.selectSingle(date);
    } else if (mode === "multiple") {
      this.selectMultiple(date);
    } else {
      this.selectRange(date);
    }
  }
  selectSingle(date) {
    const formatted = this.formatValue([date]);
    this.state.setSelectedDates([date]);
    this.state.setViewDate(date);
    this.renderCalendar();
    this.emit("select", { date, formatted });
    this.emit("change", { value: formatted });
  }
  selectMultiple(date) {
    const state = this.state.getState();
    const idx = state.selectedDates.findIndex((d) => dateEquals(d, date));
    let updated;
    if (idx >= 0) {
      updated = state.selectedDates.filter((_, i) => i !== idx);
    } else {
      updated = [...state.selectedDates, date];
    }
    this.state.setSelectedDates(updated);
    this.renderCalendar();
    this.emit("select", { date, selected: updated });
    this.emit("change", { value: this.formatValue(updated) });
  }
  selectRange(date) {
    const state = this.state.getState();
    const selected = state.selectedDates;
    let updated;
    if (selected.length === 0) {
      updated = [date];
    } else if (selected.length === 1) {
      const start = selected[0] < date ? selected[0] : date;
      const end = selected[0] < date ? date : selected[0];
      updated = [start, end];
    } else {
      updated = [date];
    }
    this.state.setSelectedDates(updated);
    this.state.setViewDate(date);
    this.renderCalendar();
    this.emit("select", { date, range: updated.length === 2 ? updated : null });
    this.emit("change", { value: this.formatValue(updated) });
  }
  handleDayKeydown(event, day) {
    const key = event.key;
    if (key === "Enter" || key === " ") {
      event.preventDefault();
      this.handleDayClick(day.date);
      return;
    }
    if (key === "ArrowLeft") {
      event.preventDefault();
      this.navigate(day.date.getFullYear(), day.date.getMonth(), -1);
    } else if (key === "ArrowRight") {
      event.preventDefault();
      this.navigate(day.date.getFullYear(), day.date.getMonth(), 1);
    } else if (key === "ArrowUp") {
      event.preventDefault();
      this.navigate(day.date.getFullYear(), day.date.getMonth(), -7);
    } else if (key === "ArrowDown") {
      event.preventDefault();
      this.navigate(day.date.getFullYear(), day.date.getMonth(), 7);
    } else if (key === "Home") {
      event.preventDefault();
      this.navigate(day.date.getFullYear(), day.date.getMonth(), -day.dayOfWeek);
    } else if (key === "End") {
      event.preventDefault();
      const daysInMonth = new Date(day.date.getFullYear(), day.date.getMonth() + 1, 0).getDate();
      this.navigate(day.date.getFullYear(), day.date.getMonth(), daysInMonth - day.day);
    } else if (key === "PageUp") {
      event.preventDefault();
      this.navigateMonth(-1);
    } else if (key === "PageDown") {
      event.preventDefault();
      this.navigateMonth(1);
    }
  }
  navigate(year, month, deltaDays) {
    const target = new Date(year, month, 1);
    target.setDate(target.getDate() + deltaDays);
    this.state.setViewDate(target);
    this.renderCalendar();
    this.emit("navigate", {
      viewDate: this.state.getState().viewDate,
      year: target.getFullYear(),
      month: target.getMonth()
    });
    this.focusDay(target);
  }
  navigateMonth(delta) {
    const state = this.state.getState();
    let newMonth = state.viewMonth + delta;
    let newYear = state.viewYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }
    this.state.setViewDate(new Date(newYear, newMonth, 1));
    this.renderCalendar();
    this.emit("navigate", {
      viewDate: this.state.getState().viewDate,
      year: newYear,
      month: newMonth
    });
    this.focusDay(this.state.getState().viewDate);
  }
  focusDay(date) {
    const cells = this.grid?.querySelectorAll('[data-testid^="dp-day-"]');
    if (!cells) return;
    const key = `dp-day-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    for (const cell of cells) {
      if (cell.dataset.testid === key) {
        cell.focus();
        return;
      }
    }
  }
  bindEvents() {
    this.header?.querySelector(".dp-nav-prev")?.addEventListener("click", () => this.navigateMonth(-1));
    this.header?.querySelector(".dp-nav-next")?.addEventListener("click", () => this.navigateMonth(1));
    this.footer?.querySelector(".dp-btn-today")?.addEventListener("click", () => this.goToToday());
    this.footer?.querySelector(".dp-btn-clear")?.addEventListener("click", () => this.clear());
    this.footer?.querySelector(".dp-btn-ok")?.addEventListener("click", () => this.close());
    this.footer?.querySelector(".dp-btn-cancel")?.addEventListener("click", () => this.close());
    document.addEventListener("click", this.handleOutsideClick.bind(this));
    document.addEventListener("keydown", this.handleDocumentKeydown.bind(this));
  }
  handleOutsideClick(event) {
    if (!this.popup) return;
    if (this.popup.contains(event.target)) return;
    if (this.activeTrigger && this.activeTrigger.contains(event.target)) return;
    this.close();
  }
  handleDocumentKeydown(event) {
    if (!this.isOpen()) return;
    if (this.popup?.contains(document.activeElement)) return;
    if (event.key === "Escape") {
      event.preventDefault();
      this.close();
    }
  }
  attachAccessibility() {
    if (this.input) {
      this.input.setAttribute("aria-expanded", "false");
      this.input.setAttribute("aria-haspopup", "dialog");
      this.input.setAttribute("aria-controls", this.popup?.id ?? "");
    }
    if (this.popup) {
      this.popup.setAttribute("aria-modal", "true");
      this.popup.setAttribute("aria-label", this.locale.placeholder ?? "Date picker");
      this.popup.setAttribute("role", "dialog");
    }
  }
  updateInputAria(expanded) {
    if (this.input) {
      this.input.setAttribute("aria-expanded", String(expanded));
    }
  }
  open() {
    if (this.isOpen()) return;
    this.state.setIsOpen(true);
    this.render();
    this.updateInputAria(true);
    this.emit("open", { viewDate: this.state.getState().viewDate });
    if (this.popup) {
      this.popup.style.display = "";
      this.popup.focus();
    }
    if (this.input) {
      this.input.focus();
    }
  }
  close() {
    if (!this.isOpen()) return;
    this.state.setIsOpen(false);
    this.updateInputAria(false);
    this.emit("close", { viewDate: this.state.getState().viewDate });
    if (this.popup) {
      this.popup.style.display = "none";
    }
    if (this.input) {
      this.input.focus();
    }
  }
  toggle() {
    if (this.isOpen()) this.close();
    else this.open();
  }
  destroy() {
    this.close();
    this.emitter.destroy();
    if (this.popup && this.popup.parentNode) {
      this.popup.parentNode.removeChild(this.popup);
    }
    if (this.root && this.root.parentNode) {
      this.root.parentNode.removeChild(this.root);
    }
    this.root = null;
    this.popup = null;
    this.grid = null;
    this.header = null;
    this.footer = null;
    this.monthLabel = null;
  }
  getValue() {
    const state = this.state.getState();
    if (state.selectedDates.length === 0) return null;
    if (state.mode === "multiple" || state.mode === "range") {
      return state.selectedDates.map((d) => this.formatValue([d])[0]);
    }
    return this.formatValue(state.selectedDates)[0];
  }
  setValue(value) {
    const parsed = this.parseValue(value, this.state.getState().calendar);
    if (parsed) {
      this.state.setSelectedDates(parsed);
      if (parsed.length === 1) {
        this.state.setViewDate(parsed[0]);
      }
      this.renderCalendar();
      this.emit("change", { value: this.formatValue(parsed) });
    }
  }
  clear() {
    this.state.setSelectedDates([]);
    this.renderCalendar();
    this.emit("clear", { value: null });
    this.emit("change", { value: null });
  }
  setLocale(code) {
    const loc = getLocale(code);
    this.locale = this.injectedLocale ? mergeLocale(loc, this.injectedLocale) : loc;
    this.state.setLocale(loc.code);
    this.render();
    if (this.input) {
      this.input.setAttribute("placeholder", this.locale.placeholder);
    }
  }
  on(event, cb) {
    return this.emitter.on(event, cb);
  }
  emit(event, payload) {
    this.emitter.emit(event, payload);
  }
  update(options) {
    if (!options) return;
    const state = this.state.getState();
    if (options.mode !== void 0) {
      this.state.setMode(options.mode);
      this.state.setSelectedDates([]);
    }
    if (options.value !== void 0) {
      const parsed = this.parseValue(options.value, this.state.getState().calendar);
      if (parsed) {
        this.state.setSelectedDates(parsed);
        if (parsed.length === 1) {
          this.state.setViewDate(parsed[0]);
        }
      }
    }
    if (options.minDate !== void 0) {
      const min = parseDateValue(options.minDate, this.state.getState().calendar);
      this.state.setMinDate(min ?? null);
    }
    if (options.maxDate !== void 0) {
      const max = parseDateValue(options.maxDate, this.state.getState().calendar);
      this.state.setMaxDate(max ?? null);
    }
    if (options.disabledDates !== void 0) {
      if (Array.isArray(options.disabledDates)) {
        this.state.setDisabledDates(new Set(options.disabledDates), null);
      } else if (typeof options.disabledDates === "function") {
        this.state.setDisabledDates(/* @__PURE__ */ new Set(), options.disabledDates);
      }
    }
    if (options.firstDayOfWeek !== void 0) {
      this.state.setFirstDayOfWeek(options.firstDayOfWeek);
    }
    if (options.calendar !== void 0) {
      const prevSelected = this.state.getState().selectedDates;
      const oldCalendar = state.calendar;
      this.state.setCalendar(options.calendar);
      if (options.calendar !== oldCalendar) {
        const newSelected = prevSelected.map((d) => {
          const comp = toCalendarComponents(d, oldCalendar);
          if (!comp) return d;
          const result = fromCalendarComponents(comp.year, comp.month, comp.day, options.calendar);
          return result ?? d;
        });
        this.state.setSelectedDates(newSelected);
      }
    }
    if (options.format !== void 0) {
      this.state.setFormat(options.format);
    }
    if (options.showTime !== void 0) {
      this.state.setShowTime(options.showTime);
    }
    if (options.timeFormat !== void 0) {
      this.state.setTimeFormat(options.timeFormat);
    }
    if (options.inline !== void 0) {
      this.state.setInline(options.inline);
      this.render();
    }
    if (options.placeholder !== void 0) {
      this.state.setPlaceholder(options.placeholder);
      if (this.input) {
        this.input.setAttribute("placeholder", options.placeholder);
      }
    }
    if (options.theme !== void 0) {
      this.state.setTheme(options.theme);
    }
    if (options.zIndex !== void 0) {
      this.state.setZIndex(options.zIndex);
      if (this.popup) {
        this.popup.style.zIndex = String(options.zIndex);
      }
    }
    if (options.locale !== void 0) {
      if (typeof options.locale === "string") {
        this.injectedLocale = void 0;
        this.setLocale(options.locale);
      } else {
        const base = getLocale(this.state.getState().locale);
        this.injectedLocale = options.locale;
        const merged = mergeLocale(base, options.locale);
        this.locale = merged;
        this.state.setLocale(merged.code);
        this.render();
        if (this.input) {
          this.input.setAttribute("placeholder", merged.placeholder ?? this.input.placeholder);
        }
      }
    }
    this.render();
  }
  getState() {
    return this.state.getState();
  }
  isOpen() {
    return this.state.getState().isOpen;
  }
  formatValue(dates) {
    const state = this.state.getState();
    return dates.map((d) => {
      const iso = ISOFromDate(d);
      if (state.format === "YYYY-MM-DD") return iso;
      return iso;
    });
  }
  goToToday() {
    const today = /* @__PURE__ */ new Date();
    this.state.setViewDate(today);
    this.renderCalendar();
    this.emit("navigate", {
      viewDate: this.state.getState().viewDate,
      year: today.getFullYear(),
      month: today.getMonth()
    });
    this.focusDay(today);
  }
};
function calendarTag(calendar) {
  return calendar === "jalali" ? "persian" : calendar === "hijri" ? "islamic" : "gregory";
}

// src/index.ts
var VERSION = "1.0.0";
function createDatePicker(element, options, elementOptions) {
  return new DatePicker(element, options, elementOptions);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DatePicker,
  EventEmitter,
  StateManager,
  VERSION,
  createDatePicker,
  dom,
  engine,
  i18n
});
