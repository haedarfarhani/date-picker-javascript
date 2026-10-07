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

// src/calendars/gregorian.ts
function isGregorianLeap(year) {
  return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
}
var MONTH_DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function gregorianMonthLength(year, month) {
  if (month === 2 && isGregorianLeap(year)) return 29;
  return MONTH_DAYS[month];
}
function gregorianYearLength(year) {
  return isGregorianLeap(year) ? 366 : 365;
}
function gregorianDayOfYear(year, month, day) {
  let doy = day;
  for (let m = 1; m < month; m++) doy += gregorianMonthLength(year, m);
  return doy;
}
function gregorianToJDN(year, month, day) {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}
function jdnToGregorian(jdn) {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor(146097 * b / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor(1461 * d / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return {
    day: e - Math.floor((153 * m + 2) / 5) + 1,
    month: m + 3 - 12 * Math.floor(m / 10),
    year: 100 * b + d - 4800 + Math.floor(m / 10)
  };
}
function gregorianDayOfWeek(year, month, day) {
  return (gregorianToJDN(year, month, day) + 1) % 7;
}

// src/calendars/jalali.ts
var BREAKS = [
  -61,
  9,
  38,
  199,
  426,
  686,
  756,
  818,
  1111,
  1181,
  1210,
  1635,
  2060,
  2097,
  2192,
  2262,
  2324,
  2394,
  2456,
  3178
];
function jalCal(jy) {
  const gy = jy + 621;
  let leapJ = -14;
  let jp = BREAKS[0];
  let jump = 0;
  let i;
  for (i = 1; i < BREAKS.length; i++) {
    const jb = BREAKS[i];
    jump = jb - jp;
    if (jy < jb) break;
    leapJ += Math.floor(jump / 33) * 8 + Math.floor(jump % 33 / 4);
    jp = jb;
  }
  let n = jy - jp;
  leapJ += Math.floor(n / 33) * 8 + Math.floor((n % 33 + 3) / 4);
  if (jump % 33 === 4 && jump - n === 4) leapJ++;
  const leapG = Math.floor(gy / 4) - Math.floor((Math.floor(gy / 100) + 1) * 3 / 4) - 150;
  const march = 20 + leapJ - leapG;
  if (jump - n < 6) {
    n -= jump - Math.ceil((jump + 6) / 33) * 33;
  }
  let leap = ((n + 1) % 33 - 1) % 4;
  if (leap === -1) leap = 4;
  return { leap, gy, march };
}
function isJalaliLeap(jy) {
  return jalCal(jy).leap === 0;
}
function jalaliMonthLength(jy, jm) {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isJalaliLeap(jy) ? 30 : 29;
}
function jalaliYearLength(jy) {
  return isJalaliLeap(jy) ? 366 : 365;
}
function jalaliDayOfYear(jm, jd) {
  return (jm <= 6 ? (jm - 1) * 31 : (jm - 1) * 30 + 6) + jd;
}
function jalaliToJDN(jy, jm, jd) {
  const { gy, march } = jalCal(jy);
  const nowruzJDN = gregorianToJDN(gy, 3, march);
  const dayOffset = jalaliDayOfYear(jm, jd) - 1;
  return nowruzJDN + dayOffset;
}
function jdnToJalali(jdn) {
  const g = jdnToGregorian(jdn);
  let jy = g.year - 621;
  let nowruz = jalaliToJDN(jy, 1, 1);
  if (nowruz > jdn) {
    jy--;
    nowruz = jalaliToJDN(jy, 1, 1);
  }
  if (jalaliToJDN(jy + 1, 1, 1) <= jdn) {
    jy++;
    nowruz = jalaliToJDN(jy, 1, 1);
  }
  const doy = jdn - nowruz + 1;
  let jm;
  let jd;
  if (doy <= 186) {
    jm = Math.ceil(doy / 31);
    jd = doy - (jm - 1) * 31;
  } else {
    const rem = doy - 186;
    jm = 6 + Math.ceil(rem / 30);
    jd = rem - (jm - 7) * 30;
  }
  return { year: jy, month: jm, day: jd };
}
function jalaliDayOfWeek(jy, jm, jd) {
  const jdn = jalaliToJDN(jy, jm, jd);
  return (jdn + 2) % 7;
}

// src/calendars/hijri.ts
var HIJRI_EPOCH_JDN = 1948439;
var HIJRI_LEAP_YEARS = /* @__PURE__ */ new Set([2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29]);
function resolveHijriAdjustment(preset = "tabular", userAdjustment = 0) {
  let presetOffset = 0;
  if (preset === "umm-alqura") {
    presetOffset = -1;
  } else if (preset === "iranian") {
    presetOffset = 0;
  }
  return presetOffset + (userAdjustment || 0);
}
function isHijriLeap(hy) {
  const mod = (hy % 30 + 30) % 30 || 30;
  return HIJRI_LEAP_YEARS.has(mod);
}
function hijriMonthLength(hy, hm) {
  if (hm % 2 === 1) return 30;
  if (hm < 12) return 29;
  return isHijriLeap(hy) ? 30 : 29;
}
function hijriYearLength(hy) {
  return isHijriLeap(hy) ? 355 : 354;
}
function hijriMonthStartOffset(hm) {
  return Math.floor((59 * (hm - 1) + 1) / 2);
}
function hijriToJDN(hy, hm, hd, adjustment = 0) {
  return HIJRI_EPOCH_JDN - 1 + (hy - 1) * 354 + Math.floor((11 * hy + 3) / 30) + hijriMonthStartOffset(hm) + hd + adjustment;
}
function jdnToHijri(jdn, adjustment = 0) {
  const adjustedJDN = jdn - adjustment;
  const shifted = adjustedJDN - HIJRI_EPOCH_JDN;
  let hy = Math.max(1, Math.ceil((shifted * 30 + 29) / 10631));
  while (hijriToJDN(hy + 1, 1, 1) <= adjustedJDN) hy++;
  while (hijriToJDN(hy, 1, 1) > adjustedJDN) hy--;
  const dayInYear = adjustedJDN - hijriToJDN(hy, 1, 1) + 1;
  let hm = 1;
  while (hm < 12 && dayInYear > hijriMonthStartOffset(hm + 1)) hm++;
  const hd = dayInYear - hijriMonthStartOffset(hm);
  return { year: hy, month: hm, day: hd };
}
function hijriDayOfWeek(hy, hm, hd, adjustment = 0) {
  const jdn = hijriToJDN(hy, hm, hd, adjustment);
  return (jdn + 2) % 7;
}

// src/SmartDateFormat.ts
var InvalidDateFormatError = class extends Error {
  constructor(message, position = -1, token = "") {
    super(message);
    this.name = "InvalidDateFormatError";
    this.position = position;
    this.token = token;
  }
};
var DEFAULT_PATTERNS = {
  jalali: { full: "l j F Y", short: "Y/m/d", iso: "Y-m-d", datetime: "Y/m/d H:i" },
  hijri: { full: "l j F Y", short: "Y/m/d", iso: "Y-m-d", datetime: "Y/m/d H:i" },
  gregorian: { full: "l, j F Y", short: "m/d/Y", iso: "Y-m-d", datetime: "Y-m-d H:i" }
};
function normalizeDigits(input) {
  return input.replace(/[۰-۹]/g, (c) => String(c.charCodeAt(0) - 1776)).replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 1632));
}
var SmartDateFormat = class _SmartDateFormat {
  constructor(pattern = DEFAULT_PATTERNS.jalali.short) {
    this.pattern = pattern;
  }
  // ---------------------------------------------------------------------------
  // Format
  // ---------------------------------------------------------------------------
  format(date, calendar = "jalali") {
    const pattern = this.pattern;
    let y;
    let m;
    let d;
    let leap;
    let daysInMonth2;
    let dow;
    let doy0;
    let dayName;
    let monthName;
    if (calendar === "jalali") {
      y = date.getShYear();
      m = date.getShMonth();
      d = date.getShDay();
      leap = isJalaliLeap(y);
      daysInMonth2 = jalaliMonthLength(y, m);
      dow = date.dayOfWeek("jalali");
      doy0 = date.getDayInYear("jalali") - 1;
      dayName = date.dayName("jalali");
      monthName = date.monthName("jalali");
    } else if (calendar === "hijri") {
      y = date.getHjYear();
      m = date.getHjMonth();
      d = date.getHjDay();
      leap = isHijriLeap(y);
      daysInMonth2 = hijriMonthLength(y, m);
      dow = date.dayOfWeek("hijri");
      doy0 = date.getDayInYear("hijri") - 1;
      dayName = date.dayName("hijri");
      monthName = date.monthName("hijri");
    } else {
      y = date.getGrgYear();
      m = date.getGrgMonth();
      d = date.getGrgDay();
      leap = isGregorianLeap(y);
      daysInMonth2 = gregorianMonthLength(y, m);
      dow = date.dayOfWeek("gregorian");
      doy0 = date.getDayInYear("gregorian") - 1;
      dayName = date.dayName("gregorian");
      monthName = date.monthName("gregorian");
    }
    const H = date.getHour();
    const g = H % 12 || 12;
    const i = date.getMinute();
    const s = date.getSecond();
    const isPM = H >= 12;
    const pad2 = (n) => String(n).padStart(2, "0");
    let amLower = "am";
    let pmLower = "pm";
    let amUpper = "AM";
    let pmUpper = "PM";
    if (calendar === "jalali") {
      amLower = "\u0642.\u0638";
      pmLower = "\u0628.\u0638";
      amUpper = "\u0642.\u0638";
      pmUpper = "\u0628.\u0638";
    } else if (calendar === "hijri") {
      amLower = "\u0635";
      pmLower = "\u0645";
      amUpper = "\u0635";
      pmUpper = "\u0645";
    }
    let result = "";
    let inLiteral = false;
    for (let idx = 0; idx < pattern.length; idx++) {
      const ch = pattern[idx];
      if (ch === "[") {
        inLiteral = true;
        continue;
      }
      if (ch === "]") {
        inLiteral = false;
        continue;
      }
      if (ch === "\\" && idx + 1 < pattern.length) {
        result += pattern[++idx];
        continue;
      }
      if (inLiteral) {
        result += ch;
        continue;
      }
      switch (ch) {
        case "l":
          result += dayName;
          break;
        case "j":
          result += String(d);
          break;
        case "d":
          result += pad2(d);
          break;
        case "F":
          result += monthName;
          break;
        case "n":
          result += String(m);
          break;
        case "m":
          result += pad2(m);
          break;
        case "t":
          result += String(daysInMonth2);
          break;
        case "Y":
          result += String(y);
          break;
        case "y":
          result += String(y).slice(-2);
          break;
        case "w":
          result += String(dow);
          break;
        case "z":
          result += String(doy0);
          break;
        case "L":
          result += leap ? "1" : "0";
          break;
        case "H":
          result += pad2(H);
          break;
        case "g":
          result += String(g);
          break;
        case "h":
          result += pad2(g);
          break;
        case "i":
          result += pad2(i);
          break;
        case "s":
          result += pad2(s);
          break;
        case "a":
          result += isPM ? pmLower : amLower;
          break;
        case "A":
          result += isPM ? pmUpper : amUpper;
          break;
        default:
          result += ch;
          break;
      }
    }
    return result;
  }
  static format(date, pattern, calendar = "jalali") {
    return new _SmartDateFormat(pattern).format(date, calendar);
  }
  // ---------------------------------------------------------------------------
  // Parse
  // ---------------------------------------------------------------------------
  static parse(dateStr, pattern, calendar = "jalali") {
    if (!dateStr || typeof dateStr !== "string") {
      throw new InvalidDateFormatError("Input date string is empty or invalid", 0, "");
    }
    const cleanInput = normalizeDigits(dateStr.trim());
    if (!pattern) {
      const candidates = [
        "yyyy-MM-dd HH:mm:ss",
        "yyyy/MM/dd HH:mm:ss",
        "yyyy-MM-dd HH:mm",
        "yyyy/MM/dd HH:mm",
        "yyyy-MM-dd",
        "yyyy/MM/dd",
        "dd/MM/yyyy",
        "yyyy.MM.dd"
      ];
      for (const cand of candidates) {
        try {
          return _SmartDateFormat.parseWithPattern(cleanInput, cand, calendar);
        } catch {
        }
      }
      throw new InvalidDateFormatError(`Unable to parse "${dateStr}" with default patterns`, 0, "");
    }
    const normalizedPattern = _SmartDateFormat.phpToParsePattern(pattern);
    try {
      return _SmartDateFormat.parseWithPattern(cleanInput, normalizedPattern, calendar);
    } catch (err) {
      const candidates = ["yyyy-MM-dd", "yyyy/MM/dd", "dd/MM/yyyy"];
      for (const cand of candidates) {
        try {
          return _SmartDateFormat.parseWithPattern(cleanInput, cand, calendar);
        } catch {
        }
      }
      throw err;
    }
  }
  static phpToParsePattern(pattern) {
    return pattern.replace(/(?<![a-zA-Z])YYYY(?![a-zA-Z])/g, "yyyy").replace(/(?<![a-zA-Z])YY(?![a-zA-Z])/g, "yy").replace(/(?<![a-zA-Z])DD(?![a-zA-Z])/g, "dd").replace(/(?<![a-zA-Z])Y(?![a-zA-Z])/g, "yyyy").replace(/(?<![a-zA-Z])y(?![a-zA-Z])/g, "yy").replace(/(?<![a-zA-Z])m(?![a-zA-Z])/g, "MM").replace(/(?<![a-zA-Z])n(?![a-zA-Z])/g, "MM").replace(/(?<![a-zA-Z])d(?![a-zA-Z])/g, "dd").replace(/(?<![a-zA-Z])j(?![a-zA-Z])/g, "dd").replace(/(?<![a-zA-Z])H(?![a-zA-Z])/g, "HH").replace(/(?<![a-zA-Z])i(?![a-zA-Z])/g, "mm").replace(/(?<![a-zA-Z])s(?![a-zA-Z])/g, "ss");
  }
  static parseGrg(dateStr, pattern) {
    return _SmartDateFormat.parse(dateStr, pattern, "gregorian");
  }
  static parseHj(dateStr, pattern) {
    return _SmartDateFormat.parse(dateStr, pattern, "hijri");
  }
  static tryParseAny(dateStr) {
    if (!dateStr || typeof dateStr !== "string") return null;
    try {
      return _SmartDateFormat.parse(dateStr);
    } catch {
      return null;
    }
  }
  static parseWithPattern(input, pattern, calendar) {
    let year = null;
    let month = null;
    let day = null;
    let hour = 0;
    let minute = 0;
    let second = 0;
    let isPM = null;
    let inputIdx = 0;
    let patIdx = 0;
    while (patIdx < pattern.length) {
      const restPat = pattern.slice(patIdx);
      if (restPat.startsWith("yyyy")) {
        const match = input.slice(inputIdx).match(/^(\d{4})/);
        if (!match) {
          throw new InvalidDateFormatError(`Expected 4-digit year at position ${inputIdx}`, inputIdx, "yyyy");
        }
        year = parseInt(match[1], 10);
        inputIdx += match[1].length;
        patIdx += 4;
      } else if (restPat.startsWith("yy")) {
        const match = input.slice(inputIdx).match(/^(\d{2})/);
        if (!match) {
          throw new InvalidDateFormatError(`Expected 2-digit year at position ${inputIdx}`, inputIdx, "yy");
        }
        const yy = parseInt(match[1], 10);
        if (calendar === "jalali") {
          year = yy >= 70 ? 1300 + yy : 1400 + yy;
        } else if (calendar === "hijri") {
          year = 1400 + yy;
        } else {
          year = yy >= 70 ? 1900 + yy : 2e3 + yy;
        }
        inputIdx += match[1].length;
        patIdx += 2;
      } else if (restPat.startsWith("MM")) {
        const match = input.slice(inputIdx).match(/^(\d{1,2})/);
        if (!match) {
          throw new InvalidDateFormatError(`Expected month at position ${inputIdx}`, inputIdx, "MM");
        }
        month = parseInt(match[1], 10);
        inputIdx += match[1].length;
        patIdx += 2;
      } else if (restPat.startsWith("dd")) {
        const match = input.slice(inputIdx).match(/^(\d{1,2})/);
        if (!match) {
          throw new InvalidDateFormatError(`Expected day at position ${inputIdx}`, inputIdx, "dd");
        }
        day = parseInt(match[1], 10);
        inputIdx += match[1].length;
        patIdx += 2;
      } else if (restPat.startsWith("HH")) {
        const match = input.slice(inputIdx).match(/^(\d{1,2})/);
        if (!match) {
          throw new InvalidDateFormatError(`Expected hour at position ${inputIdx}`, inputIdx, "HH");
        }
        hour = parseInt(match[1], 10);
        inputIdx += match[1].length;
        patIdx += 2;
      } else if (restPat.startsWith("mm")) {
        const match = input.slice(inputIdx).match(/^(\d{1,2})/);
        if (!match) {
          throw new InvalidDateFormatError(`Expected minute at position ${inputIdx}`, inputIdx, "mm");
        }
        minute = parseInt(match[1], 10);
        inputIdx += match[1].length;
        patIdx += 2;
      } else if (restPat.startsWith("ss")) {
        const match = input.slice(inputIdx).match(/^(\d{1,2})/);
        if (!match) {
          throw new InvalidDateFormatError(`Expected second at position ${inputIdx}`, inputIdx, "ss");
        }
        second = parseInt(match[1], 10);
        inputIdx += match[1].length;
        patIdx += 2;
      } else if (restPat.startsWith("a")) {
        const sub = input.slice(inputIdx).toLowerCase();
        if (sub.startsWith("pm") || sub.startsWith("\u0628.\u0638") || sub.startsWith("\u0645")) {
          isPM = true;
          inputIdx += sub.startsWith("\u0628.\u0638") ? 3 : sub.startsWith("pm") ? 2 : 1;
        } else if (sub.startsWith("am") || sub.startsWith("\u0642.\u0638") || sub.startsWith("\u0635")) {
          isPM = false;
          inputIdx += sub.startsWith("\u0642.\u0638") ? 3 : sub.startsWith("am") ? 2 : 1;
        }
        patIdx += 1;
      } else {
        const expChar = pattern[patIdx];
        if (input[inputIdx] !== expChar) {
          throw new InvalidDateFormatError(
            `Literal character "${expChar}" mismatch at position ${inputIdx} (got "${input[inputIdx]}")`,
            inputIdx,
            expChar
          );
        }
        inputIdx++;
        patIdx++;
      }
    }
    if (year === null || month === null || day === null) {
      throw new InvalidDateFormatError("Date requires at least year, month, and day", inputIdx, "");
    }
    if (month < 1 || month > 12) {
      throw new InvalidDateFormatError(`Invalid month: ${month}`, inputIdx, "MM");
    }
    let maxDays;
    if (calendar === "jalali") {
      maxDays = jalaliMonthLength(year, month);
    } else if (calendar === "hijri") {
      maxDays = hijriMonthLength(year, month);
    } else {
      maxDays = gregorianMonthLength(year, month);
    }
    if (day < 1 || day > maxDays) {
      throw new InvalidDateFormatError(
        `Invalid day: ${day} (month ${month} of year ${year} has ${maxDays} days)`,
        inputIdx,
        "dd"
      );
    }
    if (isPM !== null) {
      if (isPM && hour < 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;
    }
    const dt = new SmartDate(0);
    if (calendar === "jalali") {
      dt.setShYear(year).setShMonth(month).setShDay(day);
    } else if (calendar === "hijri") {
      dt.setHjYear(year).setHjMonth(month).setHjDay(day);
    } else {
      dt.setGrgYear(year).setGrgMonth(month).setGrgDay(day);
    }
    dt.setHour(hour).setMinute(minute).setSecond(second).setMillisecond(0);
    return dt;
  }
};

// src/SmartDate.ts
var SmartDate = class _SmartDate {
  constructor(input, hijriAdjustment = 0, hijriPreset = "tabular") {
    // Cached calendar views
    this._cachedJDN = null;
    this._cachedGrg = null;
    this._cachedSh = null;
    this._cachedHj = null;
    this._cachedTime = null;
    this._hijriPreset = hijriPreset;
    this._hijriAdjustment = resolveHijriAdjustment(hijriPreset, hijriAdjustment);
    if (input instanceof _SmartDate) {
      this._timestamp = input._timestamp;
      this._hijriAdjustment = input._hijriAdjustment;
      this._hijriPreset = input._hijriPreset;
    } else if (input instanceof Date) {
      this._timestamp = input.getTime();
    } else if (typeof input === "number") {
      this._timestamp = input;
    } else if (typeof input === "string") {
      const parsed = SmartDateFormat.tryParseAny(input);
      if (parsed) {
        this._timestamp = parsed._timestamp;
      } else {
        const d = new Date(input);
        this._timestamp = isNaN(d.getTime()) ? Date.now() : d.getTime();
      }
    } else {
      this._timestamp = Date.now();
    }
  }
  // ---------------------------------------------------------------------------
  // Static Factory Methods
  // ---------------------------------------------------------------------------
  static fromTimestamp(ts, hijriAdjustment = 0, preset = "tabular") {
    return new _SmartDate(ts, hijriAdjustment, preset);
  }
  static fromDate(d, hijriAdjustment = 0, preset = "tabular") {
    return new _SmartDate(d, hijriAdjustment, preset);
  }
  static now(hijriAdjustment = 0, preset = "tabular") {
    return new _SmartDate(Date.now(), hijriAdjustment, preset);
  }
  // ---------------------------------------------------------------------------
  // Internal Cache & Sync
  // ---------------------------------------------------------------------------
  invalidateCache() {
    this._cachedJDN = null;
    this._cachedGrg = null;
    this._cachedSh = null;
    this._cachedHj = null;
    this._cachedTime = null;
  }
  getTimeComponents() {
    if (!this._cachedTime) {
      const d = new Date(this._timestamp);
      this._cachedTime = {
        hour: d.getHours(),
        minute: d.getMinutes(),
        second: d.getSeconds(),
        ms: d.getMilliseconds()
      };
    }
    return this._cachedTime;
  }
  getGrgComponents() {
    if (!this._cachedGrg) {
      const d = new Date(this._timestamp);
      this._cachedGrg = {
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        day: d.getDate()
      };
    }
    return this._cachedGrg;
  }
  getJDN() {
    if (this._cachedJDN === null) {
      const g = this.getGrgComponents();
      this._cachedJDN = gregorianToJDN(g.year, g.month, g.day);
    }
    return this._cachedJDN;
  }
  getShComponents() {
    if (!this._cachedSh) {
      const jdn = this.getJDN();
      this._cachedSh = jdnToJalali(jdn);
    }
    return this._cachedSh;
  }
  getHjComponents() {
    if (!this._cachedHj) {
      const jdn = this.getJDN();
      this._cachedHj = jdnToHijri(jdn, this._hijriAdjustment);
    }
    return this._cachedHj;
  }
  updateFromGrg(gy, gm, gd) {
    const time = this.getTimeComponents();
    const d = new Date(gy, gm - 1, gd, time.hour, time.minute, time.second, time.ms);
    this._timestamp = d.getTime();
    this.invalidateCache();
  }
  updateFromJDN(jdn) {
    const g = jdnToGregorian(jdn);
    this.updateFromGrg(g.year, g.month, g.day);
  }
  // ---------------------------------------------------------------------------
  // Init Methods
  // ---------------------------------------------------------------------------
  initGrgDate() {
    this.invalidateCache();
    this.getGrgComponents();
  }
  initJalaliDate() {
    this.invalidateCache();
    this.getShComponents();
  }
  initHijriDate() {
    this.invalidateCache();
    this.getHjComponents();
  }
  // ---------------------------------------------------------------------------
  // Getters — Jalali (شمسی)
  // ---------------------------------------------------------------------------
  getShYear() {
    return this.getShComponents().year;
  }
  getShMonth() {
    return this.getShComponents().month;
  }
  getShDay() {
    return this.getShComponents().day;
  }
  // ---------------------------------------------------------------------------
  // Getters — Hijri (قمری)
  // ---------------------------------------------------------------------------
  getHjYear() {
    return this.getHjComponents().year;
  }
  getHjMonth() {
    return this.getHjComponents().month;
  }
  getHjDay() {
    return this.getHjComponents().day;
  }
  // ---------------------------------------------------------------------------
  // Getters — Gregorian (میلادی)
  // ---------------------------------------------------------------------------
  getGrgYear() {
    return this.getGrgComponents().year;
  }
  getGrgMonth() {
    return this.getGrgComponents().month;
  }
  getGrgDay() {
    return this.getGrgComponents().day;
  }
  // ---------------------------------------------------------------------------
  // Getters — Time
  // ---------------------------------------------------------------------------
  getHour() {
    return this.getTimeComponents().hour;
  }
  getMinute() {
    return this.getTimeComponents().minute;
  }
  getSecond() {
    return this.getTimeComponents().second;
  }
  getMillisecond() {
    return this.getTimeComponents().ms;
  }
  getTime() {
    return this._timestamp;
  }
  toDate() {
    return new Date(this._timestamp);
  }
  // ---------------------------------------------------------------------------
  // Setters — Jalali
  // ---------------------------------------------------------------------------
  setShYear(y) {
    const cur = this.getShComponents();
    const maxDay = jalaliMonthLength(y, cur.month);
    const day = Math.min(cur.day, maxDay);
    const jdn = jalaliToJDN(y, cur.month, day);
    this.updateFromJDN(jdn);
    return this;
  }
  setShMonth(m) {
    const cur = this.getShComponents();
    const maxDay = jalaliMonthLength(cur.year, m);
    const day = Math.min(cur.day, maxDay);
    const jdn = jalaliToJDN(cur.year, m, day);
    this.updateFromJDN(jdn);
    return this;
  }
  setShDay(d) {
    const cur = this.getShComponents();
    const jdn = jalaliToJDN(cur.year, cur.month, d);
    this.updateFromJDN(jdn);
    return this;
  }
  // ---------------------------------------------------------------------------
  // Setters — Hijri
  // ---------------------------------------------------------------------------
  setHjYear(y) {
    const cur = this.getHjComponents();
    const maxDay = hijriMonthLength(y, cur.month);
    const day = Math.min(cur.day, maxDay);
    const jdn = hijriToJDN(y, cur.month, day, this._hijriAdjustment);
    this.updateFromJDN(jdn);
    return this;
  }
  setHjMonth(m) {
    const cur = this.getHjComponents();
    const maxDay = hijriMonthLength(cur.year, m);
    const day = Math.min(cur.day, maxDay);
    const jdn = hijriToJDN(cur.year, m, day, this._hijriAdjustment);
    this.updateFromJDN(jdn);
    return this;
  }
  setHjDay(d) {
    const cur = this.getHjComponents();
    const jdn = hijriToJDN(cur.year, cur.month, d, this._hijriAdjustment);
    this.updateFromJDN(jdn);
    return this;
  }
  // ---------------------------------------------------------------------------
  // Setters — Gregorian
  // ---------------------------------------------------------------------------
  setGrgYear(y) {
    const cur = this.getGrgComponents();
    const maxDay = gregorianMonthLength(y, cur.month);
    const day = Math.min(cur.day, maxDay);
    this.updateFromGrg(y, cur.month, day);
    return this;
  }
  setGrgMonth(m) {
    const cur = this.getGrgComponents();
    const maxDay = gregorianMonthLength(cur.year, m);
    const day = Math.min(cur.day, maxDay);
    this.updateFromGrg(cur.year, m, day);
    return this;
  }
  setGrgDay(d) {
    const cur = this.getGrgComponents();
    this.updateFromGrg(cur.year, cur.month, d);
    return this;
  }
  // ---------------------------------------------------------------------------
  // Setters — Time
  // ---------------------------------------------------------------------------
  setHour(h) {
    const d = new Date(this._timestamp);
    d.setHours(h);
    this._timestamp = d.getTime();
    this.invalidateCache();
    return this;
  }
  setMinute(m) {
    const d = new Date(this._timestamp);
    d.setMinutes(m);
    this._timestamp = d.getTime();
    this.invalidateCache();
    return this;
  }
  setSecond(s) {
    const d = new Date(this._timestamp);
    d.setSeconds(s);
    this._timestamp = d.getTime();
    this.invalidateCache();
    return this;
  }
  setMillisecond(ms) {
    const d = new Date(this._timestamp);
    d.setMilliseconds(ms);
    this._timestamp = d.getTime();
    this.invalidateCache();
    return this;
  }
  // ---------------------------------------------------------------------------
  // Conversions (Instance and Static)
  // ---------------------------------------------------------------------------
  /** میلادی → شمسی */
  toJalali(y, m, d) {
    if (y !== void 0 && m !== void 0 && d !== void 0) {
      const jdn = gregorianToJDN(y, m, d);
      const res = jdnToJalali(jdn);
      return [res.year, res.month, res.day];
    }
    const sh = this.getShComponents();
    return [sh.year, sh.month, sh.day];
  }
  static toJalali(y, m, d) {
    const jdn = gregorianToJDN(y, m, d);
    const res = jdnToJalali(jdn);
    return [res.year, res.month, res.day];
  }
  /** قمری → شمسی */
  toJalaliFromHijri(y, m, d) {
    if (y !== void 0 && m !== void 0 && d !== void 0) {
      const jdn = hijriToJDN(y, m, d, this._hijriAdjustment);
      const res = jdnToJalali(jdn);
      return [res.year, res.month, res.day];
    }
    const sh = this.getShComponents();
    return [sh.year, sh.month, sh.day];
  }
  static toJalaliFromHijri(y, m, d, adjustment = 0) {
    const jdn = hijriToJDN(y, m, d, adjustment);
    const res = jdnToJalali(jdn);
    return [res.year, res.month, res.day];
  }
  /** شمسی → میلادی */
  toGregorian(y, m, d) {
    if (y !== void 0 && m !== void 0 && d !== void 0) {
      const jdn = jalaliToJDN(y, m, d);
      const res = jdnToGregorian(jdn);
      return [res.year, res.month, res.day];
    }
    const grg = this.getGrgComponents();
    return [grg.year, grg.month, grg.day];
  }
  static toGregorian(y, m, d) {
    const jdn = jalaliToJDN(y, m, d);
    const res = jdnToGregorian(jdn);
    return [res.year, res.month, res.day];
  }
  /** قمری → میلادی */
  toGregorianFromHijri(y, m, d) {
    if (y !== void 0 && m !== void 0 && d !== void 0) {
      const jdn = hijriToJDN(y, m, d, this._hijriAdjustment);
      const res = jdnToGregorian(jdn);
      return [res.year, res.month, res.day];
    }
    const grg = this.getGrgComponents();
    return [grg.year, grg.month, grg.day];
  }
  static toGregorianFromHijri(y, m, d, adjustment = 0) {
    const jdn = hijriToJDN(y, m, d, adjustment);
    const res = jdnToGregorian(jdn);
    return [res.year, res.month, res.day];
  }
  /** شمسی → قمری */
  toHijri(y, m, d) {
    if (y !== void 0 && m !== void 0 && d !== void 0) {
      const jdn = jalaliToJDN(y, m, d);
      const res = jdnToHijri(jdn, this._hijriAdjustment);
      return [res.year, res.month, res.day];
    }
    const hj = this.getHjComponents();
    return [hj.year, hj.month, hj.day];
  }
  static toHijri(y, m, d, adjustment = 0) {
    const jdn = jalaliToJDN(y, m, d);
    const res = jdnToHijri(jdn, adjustment);
    return [res.year, res.month, res.day];
  }
  /** میلادی → قمری */
  toHijriFromGregorian(y, m, d) {
    if (y !== void 0 && m !== void 0 && d !== void 0) {
      const jdn = gregorianToJDN(y, m, d);
      const res = jdnToHijri(jdn, this._hijriAdjustment);
      return [res.year, res.month, res.day];
    }
    const hj = this.getHjComponents();
    return [hj.year, hj.month, hj.day];
  }
  static toHijriFromGregorian(y, m, d, adjustment = 0) {
    const jdn = gregorianToJDN(y, m, d);
    const res = jdnToHijri(jdn, adjustment);
    return [res.year, res.month, res.day];
  }
  /** General converter between calendars */
  convert(from, to, y, m, d) {
    if (y !== void 0 && m !== void 0 && d !== void 0) {
      let jdn;
      if (from === "gregorian") jdn = gregorianToJDN(y, m, d);
      else if (from === "jalali") jdn = jalaliToJDN(y, m, d);
      else jdn = hijriToJDN(y, m, d, this._hijriAdjustment);
      if (to === "gregorian") {
        const r2 = jdnToGregorian(jdn);
        return [r2.year, r2.month, r2.day];
      }
      if (to === "jalali") {
        const r2 = jdnToJalali(jdn);
        return [r2.year, r2.month, r2.day];
      }
      const r = jdnToHijri(jdn, this._hijriAdjustment);
      return [r.year, r.month, r.day];
    }
    if (to === "gregorian") return this.toGregorian();
    if (to === "jalali") return this.toJalali();
    return this.toHijri();
  }
  static convert(from, to, y, m, d, adjustment = 0) {
    let jdn;
    if (from === "gregorian") jdn = gregorianToJDN(y, m, d);
    else if (from === "jalali") jdn = jalaliToJDN(y, m, d);
    else jdn = hijriToJDN(y, m, d, adjustment);
    if (to === "gregorian") {
      const r2 = jdnToGregorian(jdn);
      return [r2.year, r2.month, r2.day];
    }
    if (to === "jalali") {
      const r2 = jdnToJalali(jdn);
      return [r2.year, r2.month, r2.day];
    }
    const r = jdnToHijri(jdn, adjustment);
    return [r.year, r.month, r.day];
  }
  // ---------------------------------------------------------------------------
  // Calendar Calculations
  // ---------------------------------------------------------------------------
  isLeap(calendar = "jalali") {
    if (calendar === "jalali") return isJalaliLeap(this.getShYear());
    if (calendar === "gregorian") return isGregorianLeap(this.getGrgYear());
    return isHijriLeap(this.getHjYear());
  }
  grgIsLeap() {
    return isGregorianLeap(this.getGrgYear());
  }
  hjIsLeap() {
    return isHijriLeap(this.getHjYear());
  }
  /**
   * Day of week: 0-6.
   * For Jalali: 0=Saturday (شنبه), 1=Sunday, ..., 6=Friday.
   * For Gregorian: 0=Sunday, 1=Monday, ..., 6=Saturday.
   * For Hijri: 0=Saturday (السبت) or Sunday. Defaults to 0=Saturday in Arabic week.
   */
  dayOfWeek(calendar = "jalali") {
    if (calendar === "jalali") {
      return jalaliDayOfWeek(this.getShYear(), this.getShMonth(), this.getShDay());
    }
    if (calendar === "gregorian") {
      return gregorianDayOfWeek(this.getGrgYear(), this.getGrgMonth(), this.getGrgDay());
    }
    return hijriDayOfWeek(this.getHjYear(), this.getHjMonth(), this.getHjDay(), this._hijriAdjustment);
  }
  getDayInYear(calendar = "jalali") {
    if (calendar === "jalali") {
      return jalaliDayOfYear(this.getShMonth(), this.getShDay());
    }
    if (calendar === "gregorian") {
      return gregorianDayOfYear(this.getGrgYear(), this.getGrgMonth(), this.getGrgDay());
    }
    const jdn = this.getJDN();
    const hy = this.getHjYear();
    const startJdn = hijriToJDN(hy, 1, 1, this._hijriAdjustment);
    return jdn - startJdn + 1;
  }
  getMonthDays(calendar = "jalali") {
    if (calendar === "jalali") return jalaliMonthLength(this.getShYear(), this.getShMonth());
    if (calendar === "gregorian") return gregorianMonthLength(this.getGrgYear(), this.getGrgMonth());
    return hijriMonthLength(this.getHjYear(), this.getHjMonth());
  }
  getMonthLength(calendar = "jalali") {
    return this.getMonthDays(calendar);
  }
  getDaysInMonth(calendar, y, m) {
    if (calendar === "jalali") return jalaliMonthLength(y, m);
    if (calendar === "gregorian") return gregorianMonthLength(y, m);
    return hijriMonthLength(y, m);
  }
  dayName(calendar = "jalali") {
    const dow = this.dayOfWeek(calendar);
    if (calendar === "jalali") {
      const names2 = ["\u0634\u0646\u0628\u0647", "\u06CC\u06A9\u0634\u0646\u0628\u0647", "\u062F\u0648\u0634\u0646\u0628\u0647", "\u0633\u0647\u200C\u0634\u0646\u0628\u0647", "\u0686\u0647\u0627\u0631\u0634\u0646\u0628\u0647", "\u067E\u0646\u062C\u200C\u0634\u0646\u0628\u0647", "\u062C\u0645\u0639\u0647"];
      return names2[dow] || "";
    }
    if (calendar === "hijri") {
      const names2 = ["\u0627\u0644\u0633\u0628\u062A", "\u0627\u0644\u0623\u062D\u062F", "\u0627\u0644\u0627\u062B\u0646\u064A\u0646", "\u0627\u0644\u062B\u0644\u0627\u062B\u0627\u0621", "\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621", "\u0627\u0644\u062E\u0645\u064A\u0633", "\u0627\u0644\u062C\u0645\u0639\u0629"];
      return names2[dow] || "";
    }
    const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return names[dow] || "";
  }
  monthName(calendar = "jalali") {
    if (calendar === "jalali") {
      const names2 = [
        "",
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
        "\u0627\u0633\u0641\u0646\u062F"
      ];
      return names2[this.getShMonth()] || "";
    }
    if (calendar === "hijri") {
      const names2 = [
        "",
        "\u0645\u062D\u0631\u0645",
        "\u0635\u0641\u0631",
        "\u0631\u0628\u064A\u0639 \u0627\u0644\u0623\u0648\u0644",
        "\u0631\u0628\u064A\u0639 \u0627\u0644\u0622\u062E\u0631",
        "\u062C\u0645\u0627\u062F\u0649 \u0627\u0644\u0623\u0648\u0644\u0649",
        "\u062C\u0645\u0627\u062F\u0649 \u0627\u0644\u0622\u062E\u0631\u0629",
        "\u0631\u062C\u0628",
        "\u0634\u0639\u0628\u0627\u0646",
        "\u0631\u0645\u0636\u0627\u0646",
        "\u0634\u0648\u0627\u0644",
        "\u0630\u0648 \u0627\u0644\u0642\u0639\u062F\u0629",
        "\u0630\u0648 \u0627\u0644\u062D\u062C\u0629"
      ];
      return names2[this.getHjMonth()] || "";
    }
    const names = [
      "",
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
    ];
    return names[this.getGrgMonth()] || "";
  }
  // ---------------------------------------------------------------------------
  // Manipulation & Arithmetic
  // ---------------------------------------------------------------------------
  clone() {
    return new _SmartDate(this._timestamp, this._hijriAdjustment, this._hijriPreset);
  }
  addDays(n) {
    const copy = this.clone();
    const curJdn = copy.getJDN();
    copy.updateFromJDN(curJdn + n);
    return copy;
  }
  subDays(n) {
    return this.addDays(-n);
  }
  addMonths(n, calendar = "jalali") {
    const copy = this.clone();
    if (calendar === "jalali") {
      let y2 = copy.getShYear();
      let m2 = copy.getShMonth() + n;
      const d2 = copy.getShDay();
      while (m2 > 12) {
        m2 -= 12;
        y2++;
      }
      while (m2 < 1) {
        m2 += 12;
        y2--;
      }
      const maxDays2 = jalaliMonthLength(y2, m2);
      const clampedDay2 = Math.min(d2, maxDays2);
      const jdn = jalaliToJDN(y2, m2, clampedDay2);
      copy.updateFromJDN(jdn);
      return copy;
    }
    if (calendar === "hijri") {
      let y2 = copy.getHjYear();
      let m2 = copy.getHjMonth() + n;
      const d2 = copy.getHjDay();
      while (m2 > 12) {
        m2 -= 12;
        y2++;
      }
      while (m2 < 1) {
        m2 += 12;
        y2--;
      }
      const maxDays2 = hijriMonthLength(y2, m2);
      const clampedDay2 = Math.min(d2, maxDays2);
      const jdn = hijriToJDN(y2, m2, clampedDay2, copy._hijriAdjustment);
      copy.updateFromJDN(jdn);
      return copy;
    }
    let y = copy.getGrgYear();
    let m = copy.getGrgMonth() + n;
    const d = copy.getGrgDay();
    while (m > 12) {
      m -= 12;
      y++;
    }
    while (m < 1) {
      m += 12;
      y--;
    }
    const maxDays = gregorianMonthLength(y, m);
    const clampedDay = Math.min(d, maxDays);
    copy.updateFromGrg(y, m, clampedDay);
    return copy;
  }
  subMonths(n, calendar = "jalali") {
    return this.addMonths(-n, calendar);
  }
  addYears(n, calendar = "jalali") {
    const copy = this.clone();
    if (calendar === "jalali") {
      const y2 = copy.getShYear() + n;
      const m2 = copy.getShMonth();
      const d2 = copy.getShDay();
      const maxDays2 = jalaliMonthLength(y2, m2);
      const clampedDay2 = Math.min(d2, maxDays2);
      const jdn = jalaliToJDN(y2, m2, clampedDay2);
      copy.updateFromJDN(jdn);
      return copy;
    }
    if (calendar === "hijri") {
      const y2 = copy.getHjYear() + n;
      const m2 = copy.getHjMonth();
      const d2 = copy.getHjDay();
      const maxDays2 = hijriMonthLength(y2, m2);
      const clampedDay2 = Math.min(d2, maxDays2);
      const jdn = hijriToJDN(y2, m2, clampedDay2, copy._hijriAdjustment);
      copy.updateFromJDN(jdn);
      return copy;
    }
    const y = copy.getGrgYear() + n;
    const m = copy.getGrgMonth();
    const d = copy.getGrgDay();
    const maxDays = gregorianMonthLength(y, m);
    const clampedDay = Math.min(d, maxDays);
    copy.updateFromGrg(y, m, clampedDay);
    return copy;
  }
  subYears(n, calendar = "jalali") {
    return this.addYears(-n, calendar);
  }
  addDate(years, months, days) {
    return this.addYears(years).addMonths(months).addDays(days);
  }
  startOfDay() {
    const copy = this.clone();
    copy.setHour(0).setMinute(0).setSecond(0).setMillisecond(0);
    return copy;
  }
  startOfMonth(calendar = "jalali") {
    const copy = this.clone().startOfDay();
    if (calendar === "jalali") return copy.setShDay(1);
    if (calendar === "hijri") return copy.setHjDay(1);
    return copy.setGrgDay(1);
  }
  startOfYear(calendar = "jalali") {
    const copy = this.clone().startOfDay();
    if (calendar === "jalali") return copy.setShMonth(1).setShDay(1);
    if (calendar === "hijri") return copy.setHjMonth(1).setHjDay(1);
    return copy.setGrgMonth(1).setGrgDay(1);
  }
  endOfMonth(calendar = "jalali") {
    const copy = this.clone();
    copy.setHour(23).setMinute(59).setSecond(59).setMillisecond(999);
    const maxDay = copy.getMonthDays(calendar);
    if (calendar === "jalali") return copy.setShDay(maxDay);
    if (calendar === "hijri") return copy.setHjDay(maxDay);
    return copy.setGrgDay(maxDay);
  }
  endOfYear(calendar = "jalali") {
    const copy = this.clone();
    copy.setHour(23).setMinute(59).setSecond(59).setMillisecond(999);
    if (calendar === "jalali") {
      const maxDay2 = jalaliMonthLength(copy.getShYear(), 12);
      return copy.setShMonth(12).setShDay(maxDay2);
    }
    if (calendar === "hijri") {
      const maxDay2 = hijriMonthLength(copy.getHjYear(), 12);
      return copy.setHjMonth(12).setHjDay(maxDay2);
    }
    const maxDay = gregorianMonthLength(copy.getGrgYear(), 12);
    return copy.setGrgMonth(12).setGrgDay(maxDay);
  }
  // ---------------------------------------------------------------------------
  // Comparison
  // ---------------------------------------------------------------------------
  after(other) {
    return this.getTime() > other.getTime();
  }
  before(other) {
    return this.getTime() < other.getTime();
  }
  equals(other) {
    return this.getTime() === other.getTime();
  }
  compare(other) {
    const t1 = this.getTime();
    const t2 = other.getTime();
    if (t1 < t2) return -1;
    if (t1 > t2) return 1;
    return 0;
  }
  diff(other, calendar = "jalali") {
    let d1 = this.clone();
    let d2 = other.clone();
    const isNegative = d1.before(d2);
    if (isNegative) {
      const temp = d1;
      d1 = d2;
      d2 = temp;
    }
    let y1, m1, day1;
    let y2, m2, day2;
    if (calendar === "jalali") {
      y1 = d1.getShYear();
      m1 = d1.getShMonth();
      day1 = d1.getShDay();
      y2 = d2.getShYear();
      m2 = d2.getShMonth();
      day2 = d2.getShDay();
    } else if (calendar === "hijri") {
      y1 = d1.getHjYear();
      m1 = d1.getHjMonth();
      day1 = d1.getHjDay();
      y2 = d2.getHjYear();
      m2 = d2.getHjMonth();
      day2 = d2.getHjDay();
    } else {
      y1 = d1.getGrgYear();
      m1 = d1.getGrgMonth();
      day1 = d1.getGrgDay();
      y2 = d2.getGrgYear();
      m2 = d2.getGrgMonth();
      day2 = d2.getGrgDay();
    }
    let years = y1 - y2;
    let months = m1 - m2;
    let days = day1 - day2;
    if (days < 0) {
      months--;
      const prevMonth = m1 === 1 ? 12 : m1 - 1;
      const prevYear = m1 === 1 ? y1 - 1 : y1;
      const prevMonthDays = this.getDaysInMonth(calendar, prevYear, prevMonth);
      days += prevMonthDays;
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    return {
      years: isNegative ? -years : years,
      months: isNegative ? -months : months,
      days: isNegative ? -days : days
    };
  }
  untilToday(calendar = "jalali") {
    const today = _SmartDate.now(this._hijriAdjustment, this._hijriPreset);
    return this.diff(today, calendar);
  }
  getDayUntilToday(calendar = "jalali") {
    const today = _SmartDate.now(this._hijriAdjustment, this._hijriPreset).startOfDay();
    const current = this.startOfDay();
    return Math.round((today.getTime() - current.getTime()) / (24 * 60 * 60 * 1e3));
  }
  // ---------------------------------------------------------------------------
  // Format
  // ---------------------------------------------------------------------------
  format(pattern, calendar) {
    return new SmartDateFormat(pattern).format(this, calendar);
  }
};

// src/state.ts
var StateManager = class {
  constructor(initial = {}) {
    const now = /* @__PURE__ */ new Date();
    const smartNow = new SmartDate(now);
    const cal = initial.calendar || "gregorian";
    let initialYear = now.getFullYear();
    let initialMonth = now.getMonth();
    if (cal === "jalali") {
      initialYear = smartNow.getShYear();
      initialMonth = smartNow.getShMonth() - 1;
    } else if (cal === "hijri") {
      initialYear = smartNow.getHjYear();
      initialMonth = smartNow.getHjMonth() - 1;
    }
    this.state = {
      viewDate: initial.viewDate || now,
      viewYear: initial.viewYear ?? initialYear,
      viewMonth: initial.viewMonth ?? initialMonth,
      selectedDates: initial.selectedDates || [],
      selectedSmartDates: initial.selectedSmartDates || [],
      mode: initial.mode || "single",
      calendar: cal,
      calendarSwitcher: initial.calendarSwitcher || false,
      isOpen: initial.isOpen || false,
      showTime: initial.showTime || false,
      timeFormat: initial.timeFormat || "24h",
      hour: initial.hour ?? now.getHours(),
      minute: initial.minute ?? now.getMinutes(),
      second: initial.second ?? 0,
      theme: initial.theme || "light",
      design: initial.design || "default",
      layout: initial.layout || "popup",
      monthsCount: initial.monthsCount || 2,
      firstDayOfWeek: initial.firstDayOfWeek ?? (cal === "jalali" ? 6 : cal === "hijri" ? 6 : 0),
      locale: initial.locale || (cal === "jalali" ? "fa-IR" : cal === "hijri" ? "ar-SA" : "en-US"),
      minDate: initial.minDate || null,
      maxDate: initial.maxDate || null,
      minSmartDate: initial.minSmartDate || null,
      maxSmartDate: initial.maxSmartDate || null,
      disabledDates: initial.disabledDates || /* @__PURE__ */ new Set(),
      disabledDateFn: initial.disabledDateFn || null,
      disabledWeekdays: initial.disabledWeekdays || [],
      format: initial.format || "YYYY-MM-DD",
      pattern: initial.pattern || (cal === "jalali" ? "Y/m/d" : cal === "hijri" ? "Y/m/d" : "Y-m-d"),
      inline: initial.inline || false,
      placeholder: initial.placeholder || "Select date",
      zIndex: initial.zIndex || 1e3,
      hijriAdjustment: initial.hijriAdjustment || 0,
      hijriPreset: initial.hijriPreset || "tabular",
      numeralSystem: initial.numeralSystem || (cal === "jalali" ? "arabext" : "latn")
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
    const smart = new SmartDate(date, this.state.hijriAdjustment, this.state.hijriPreset);
    if (this.state.calendar === "jalali") {
      this.state.viewYear = smart.getShYear();
      this.state.viewMonth = smart.getShMonth() - 1;
    } else if (this.state.calendar === "hijri") {
      this.state.viewYear = smart.getHjYear();
      this.state.viewMonth = smart.getHjMonth() - 1;
    } else {
      this.state.viewYear = date.getFullYear();
      this.state.viewMonth = date.getMonth();
    }
  }
  setViewYearMonth(year, month) {
    this.state.viewYear = year;
    this.state.viewMonth = month;
  }
  setSelectedDates(dates) {
    this.state.selectedDates = dates;
    this.state.selectedSmartDates = dates.map(
      (d) => new SmartDate(d, this.state.hijriAdjustment, this.state.hijriPreset)
    );
  }
  setSelectedSmartDates(smartDates) {
    this.state.selectedSmartDates = smartDates;
    this.state.selectedDates = smartDates.map((s) => s.toDate());
  }
  setMode(mode) {
    this.state.mode = mode;
  }
  setCalendar(calendar) {
    this.state.calendar = calendar;
    const refDate = this.state.selectedDates.length > 0 ? this.state.selectedDates[0] : this.state.viewDate;
    const smart = new SmartDate(refDate, this.state.hijriAdjustment, this.state.hijriPreset);
    if (calendar === "jalali") {
      this.state.viewYear = smart.getShYear();
      this.state.viewMonth = smart.getShMonth() - 1;
    } else if (calendar === "hijri") {
      this.state.viewYear = smart.getHjYear();
      this.state.viewMonth = smart.getHjMonth() - 1;
    } else {
      this.state.viewYear = smart.getGrgYear();
      this.state.viewMonth = smart.getGrgMonth() - 1;
    }
  }
  setIsOpen(open) {
    this.state.isOpen = open;
  }
  setTheme(theme) {
    this.state.theme = theme;
  }
  setDesign(design) {
    this.state.design = design;
  }
  setLayout(layout) {
    this.state.layout = layout;
  }
  setLocale(locale) {
    this.state.locale = locale;
  }
  setFirstDayOfWeek(day) {
    this.state.firstDayOfWeek = day;
  }
  setMinDate(date) {
    this.state.minDate = date;
    this.state.minSmartDate = date ? new SmartDate(date, this.state.hijriAdjustment, this.state.hijriPreset) : null;
  }
  setMaxDate(date) {
    this.state.maxDate = date;
    this.state.maxSmartDate = date ? new SmartDate(date, this.state.hijriAdjustment, this.state.hijriPreset) : null;
  }
  setDisabledDates(dates, fn, weekdays = []) {
    this.state.disabledDates = dates;
    this.state.disabledDateFn = fn;
    this.state.disabledWeekdays = weekdays;
  }
  setFormat(format) {
    this.state.format = format;
  }
  setPattern(pattern) {
    this.state.pattern = pattern;
  }
  setShowTime(show) {
    this.state.showTime = show;
  }
  setTimeFormat(format) {
    this.state.timeFormat = format;
  }
  setTime(hour, minute, second = 0) {
    this.state.hour = hour;
    this.state.minute = minute;
    this.state.second = second;
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
  setNumeralSystem(numeral) {
    this.state.numeralSystem = numeral;
  }
};

// src/i18n.ts
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

// src/engine.ts
function formatDate(date, format, calendar = "gregorian") {
  const d = date instanceof SmartDate ? date : new SmartDate(date);
  if (/[YymdjnltwzLHgghisAa]/.test(format) && !format.includes("YYYY")) {
    return new SmartDateFormat(format).format(d, calendar);
  }
  let year = d.getGrgYear();
  let month = d.getGrgMonth();
  let day = d.getGrgDay();
  if (calendar === "jalali") {
    year = d.getShYear();
    month = d.getShMonth();
    day = d.getShDay();
  } else if (calendar === "hijri") {
    year = d.getHjYear();
    month = d.getHjMonth();
    day = d.getHjDay();
  }
  const mStr = String(month).padStart(2, "0");
  const dStr = String(day).padStart(2, "0");
  return format.replace("YYYY", String(year)).replace("MM", mStr).replace("DD", dStr);
}
function parseDate(value, pattern, calendar = "gregorian") {
  if (!value) return [];
  const parseSingle = (v) => {
    if (!v || typeof v !== "string") return null;
    const clean = normalizeDigits(v.trim());
    const mIso = clean.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (mIso) {
      const y = parseInt(mIso[1], 10);
      const m = parseInt(mIso[2], 10);
      const d2 = parseInt(mIso[3], 10);
      if (m < 1 || m > 12 || d2 < 1 || d2 > 31) return null;
      if (calendar === "jalali") {
        const sd = new SmartDate(0);
        sd.setShYear(y).setShMonth(m).setShDay(d2);
        return sd.toDate();
      }
      if (calendar === "hijri") {
        const sd = new SmartDate(0);
        sd.setHjYear(y).setHjMonth(m).setHjDay(d2);
        return sd.toDate();
      }
      return new Date(y, m - 1, d2);
    }
    try {
      const sd = SmartDateFormat.parse(clean, pattern, calendar);
      return sd.toDate();
    } catch {
      const dt = new Date(clean);
      return isNaN(dt.getTime()) ? null : dt;
    }
  };
  if (Array.isArray(value)) {
    return value.map(parseSingle).filter((d2) => d2 !== null);
  }
  const d = parseSingle(value);
  return d ? [d] : [];
}
function isSameDay(a, b) {
  const t1 = a instanceof SmartDate ? a.toDate() : a;
  const t2 = b instanceof SmartDate ? b.toDate() : b;
  return t1.getFullYear() === t2.getFullYear() && t1.getMonth() === t2.getMonth() && t1.getDate() === t2.getDate();
}
function isToday(date) {
  return isSameDay(date, /* @__PURE__ */ new Date());
}
function isDisabledDate(date, minDate, maxDate, disabledDates, disabledDateFn, disabledWeekdays = [], calendar = "gregorian") {
  if (minDate) {
    const dStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const minStart = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()).getTime();
    if (dStart < minStart) return true;
  }
  if (maxDate) {
    const dStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const maxStart = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate()).getTime();
    if (dStart > maxStart) return true;
  }
  const iso = formatDate(date, "YYYY-MM-DD", calendar);
  if (disabledDates.has(iso) || disabledDates.has(formatDate(date, "YYYY-MM-DD", "gregorian"))) {
    return true;
  }
  if (disabledDateFn && disabledDateFn(date)) {
    return true;
  }
  if (disabledWeekdays && disabledWeekdays.length > 0) {
    const sd = new SmartDate(date);
    const dow = sd.dayOfWeek(calendar);
    if (disabledWeekdays.includes(dow) || disabledWeekdays.includes(date.getDay())) {
      return true;
    }
  }
  return false;
}
function getDaysInMonth(year, month, calendar = "gregorian") {
  const m1 = month >= 0 && month <= 11 ? month + 1 : month;
  if (calendar === "jalali") {
    return jalaliMonthLength(year, m1);
  }
  if (calendar === "hijri") {
    return hijriMonthLength(year, m1);
  }
  return gregorianMonthLength(year, m1);
}
function generateMonthDays(year, month, selectedDates, minDate, maxDate, disabledDates, disabledDateFn, localeCode, calendar = "gregorian", disabledWeekdays = [], mode = "single") {
  const days = [];
  const locale = getLocale(localeCode);
  const firstDayOfWeek = locale.firstDay ?? (calendar === "jalali" ? 6 : 0);
  const m1 = month + 1;
  const totalDaysInMonth = getDaysInMonth(year, month, calendar);
  let firstDayDate;
  if (calendar === "jalali") {
    const jdn = jalaliToJDN(year, m1, 1);
    const g = jdnToGregorian(jdn);
    firstDayDate = new Date(g.year, g.month - 1, g.day);
  } else if (calendar === "hijri") {
    const jdn = hijriToJDN(year, m1, 1);
    const g = jdnToGregorian(jdn);
    firstDayDate = new Date(g.year, g.month - 1, g.day);
  } else {
    firstDayDate = new Date(year, month, 1);
  }
  let startCol = (firstDayDate.getDay() - firstDayOfWeek + 7) % 7;
  const prevMonth1 = m1 === 1 ? 12 : m1 - 1;
  const prevYear = m1 === 1 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth1 - 1, calendar);
  for (let i = startCol - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    let cellDate;
    if (calendar === "jalali") {
      const jdn = jalaliToJDN(prevYear, prevMonth1, d);
      const g = jdnToGregorian(jdn);
      cellDate = new Date(g.year, g.month - 1, g.day);
    } else if (calendar === "hijri") {
      const jdn = hijriToJDN(prevYear, prevMonth1, d);
      const g = jdnToGregorian(jdn);
      cellDate = new Date(g.year, g.month - 1, g.day);
    } else {
      cellDate = new Date(prevYear, prevMonth1 - 1, d);
    }
    const smart = new SmartDate(cellDate);
    const isSelected = selectedDates.some((sd) => isSameDay(sd, cellDate));
    const rangeInfo = calculateRangeFlags(cellDate, selectedDates, mode);
    days.push({
      date: cellDate,
      smartDate: smart,
      day: d,
      month: prevMonth1 - 1,
      year: prevYear,
      calendar,
      isCurrentMonth: false,
      isToday: isToday(cellDate),
      isSelected,
      isDisabled: isDisabledDate(cellDate, minDate, maxDate, disabledDates, disabledDateFn, disabledWeekdays, calendar),
      isInRange: rangeInfo.isInRange,
      isRangeStart: rangeInfo.isRangeStart,
      isRangeEnd: rangeInfo.isRangeEnd
    });
  }
  for (let d = 1; d <= totalDaysInMonth; d++) {
    let cellDate;
    if (calendar === "jalali") {
      const jdn = jalaliToJDN(year, m1, d);
      const g = jdnToGregorian(jdn);
      cellDate = new Date(g.year, g.month - 1, g.day);
    } else if (calendar === "hijri") {
      const jdn = hijriToJDN(year, m1, d);
      const g = jdnToGregorian(jdn);
      cellDate = new Date(g.year, g.month - 1, g.day);
    } else {
      cellDate = new Date(year, month, d);
    }
    const smart = new SmartDate(cellDate);
    const isSelected = selectedDates.some((sd) => isSameDay(sd, cellDate));
    const rangeInfo = calculateRangeFlags(cellDate, selectedDates, mode);
    days.push({
      date: cellDate,
      smartDate: smart,
      day: d,
      month,
      year,
      calendar,
      isCurrentMonth: true,
      isToday: isToday(cellDate),
      isSelected,
      isDisabled: isDisabledDate(cellDate, minDate, maxDate, disabledDates, disabledDateFn, disabledWeekdays, calendar),
      isInRange: rangeInfo.isInRange,
      isRangeStart: rangeInfo.isRangeStart,
      isRangeEnd: rangeInfo.isRangeEnd
    });
  }
  const totalCells = Math.ceil(days.length / 7) * 7;
  const remaining = totalCells - days.length;
  const nextMonth1 = m1 === 12 ? 1 : m1 + 1;
  const nextYear = m1 === 12 ? year + 1 : year;
  for (let d = 1; d <= remaining; d++) {
    let cellDate;
    if (calendar === "jalali") {
      const jdn = jalaliToJDN(nextYear, nextMonth1, d);
      const g = jdnToGregorian(jdn);
      cellDate = new Date(g.year, g.month - 1, g.day);
    } else if (calendar === "hijri") {
      const jdn = hijriToJDN(nextYear, nextMonth1, d);
      const g = jdnToGregorian(jdn);
      cellDate = new Date(g.year, g.month - 1, g.day);
    } else {
      cellDate = new Date(nextYear, nextMonth1 - 1, d);
    }
    const smart = new SmartDate(cellDate);
    const isSelected = selectedDates.some((sd) => isSameDay(sd, cellDate));
    const rangeInfo = calculateRangeFlags(cellDate, selectedDates, mode);
    days.push({
      date: cellDate,
      smartDate: smart,
      day: d,
      month: nextMonth1 - 1,
      year: nextYear,
      calendar,
      isCurrentMonth: false,
      isToday: isToday(cellDate),
      isSelected,
      isDisabled: isDisabledDate(cellDate, minDate, maxDate, disabledDates, disabledDateFn, disabledWeekdays, calendar),
      isInRange: rangeInfo.isInRange,
      isRangeStart: rangeInfo.isRangeStart,
      isRangeEnd: rangeInfo.isRangeEnd
    });
  }
  return days;
}
function calculateRangeFlags(date, selectedDates, mode) {
  if (mode !== "range" || selectedDates.length === 0) {
    return { isInRange: false, isRangeStart: false, isRangeEnd: false };
  }
  const dTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const d0 = new Date(selectedDates[0].getFullYear(), selectedDates[0].getMonth(), selectedDates[0].getDate()).getTime();
  if (selectedDates.length === 1) {
    return {
      isInRange: false,
      isRangeStart: dTime === d0,
      isRangeEnd: false
    };
  }
  const d1 = new Date(selectedDates[1].getFullYear(), selectedDates[1].getMonth(), selectedDates[1].getDate()).getTime();
  const start = Math.min(d0, d1);
  const end = Math.max(d0, d1);
  return {
    isRangeStart: dTime === start,
    isRangeEnd: dTime === end,
    isInRange: dTime > start && dTime < end
  };
}

// src/dom.ts
var NUMERAL_MAPS = {
  latn: "0123456789",
  arab: "\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669",
  arabext: "\u06F0\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9"
};
function toLocalDigits(n, system = "latn") {
  if (system === "latn") return String(n);
  const map = NUMERAL_MAPS[system] || NUMERAL_MAPS.latn;
  return String(n).replace(/\d/g, (d) => map[parseInt(d, 10)]);
}
var CHEVRON_LEFT_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 18l-6-6 6-6"/></svg>`;
var CHEVRON_RIGHT_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 18l6-6-6-6"/></svg>`;
var CALENDAR_ICON_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
function createCalendarCellElement(cell, locale, numeralSystem = "latn") {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "dp-day";
  el.setAttribute("role", "gridcell");
  if (cell.isSelected) {
    el.classList.add("dp-day--selected");
    el.setAttribute("aria-selected", "true");
  } else {
    el.setAttribute("aria-selected", "false");
  }
  if (cell.isToday) {
    el.classList.add("dp-day--today");
  }
  if (cell.isDisabled) {
    el.classList.add("dp-day--disabled");
    el.setAttribute("aria-disabled", "true");
    el.disabled = true;
  }
  if (cell.isRangeStart) {
    el.classList.add("dp-day--range-start");
  }
  if (cell.isRangeEnd) {
    el.classList.add("dp-day--range-end");
  }
  if (cell.isInRange) {
    el.classList.add("dp-day--in-range");
  }
  if (!cell.isCurrentMonth) {
    el.classList.add("dp-day--other-month");
  }
  el.textContent = toLocalDigits(cell.day, numeralSystem);
  el.setAttribute("data-date", cell.date.toISOString());
  el.setAttribute("data-day", String(cell.day));
  el.setAttribute("data-month", String(cell.month));
  el.setAttribute("data-year", String(cell.year));
  return el;
}
function createWeekdayHeaders(locale) {
  const headers = [];
  const days = [...locale.days];
  const firstDay = locale.firstDay;
  for (let i = 0; i < firstDay; i++) {
    const day = days.shift();
    if (day) {
      days.push(day);
    }
  }
  for (const day of days) {
    const el = document.createElement("div");
    el.className = "dp-weekday";
    el.textContent = day;
    headers.push(el);
  }
  return headers;
}
function createCalendarSwitcher(currentCalendar, onSwitch) {
  const wrapper = document.createElement("div");
  wrapper.className = "dp-calendar-switcher";
  const calendars = [
    { id: "jalali", label: "\u0634\u0645\u0633\u06CC" },
    { id: "gregorian", label: "\u0645\u06CC\u0644\u0627\u062F\u06CC" },
    { id: "hijri", label: "\u0642\u0645\u0631\u06CC" }
  ];
  calendars.forEach((c) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "dp-calendar-switcher-btn";
    if (c.id === currentCalendar) {
      btn.classList.add("dp-calendar-switcher-btn--active");
    }
    btn.textContent = c.label;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      onSwitch(c.id);
    });
    wrapper.appendChild(btn);
  });
  return wrapper;
}
function createTimePicker(hour, minute, timeFormat, onChange) {
  const container = document.createElement("div");
  container.className = "dp-timepicker";
  const label = document.createElement("span");
  label.className = "dp-time-label";
  label.textContent = "\u0632\u0645\u0627\u0646:";
  container.appendChild(label);
  const is12h = timeFormat === "12h";
  let isPM = hour >= 12;
  let displayHour = is12h ? hour % 12 || 12 : hour;
  const hourStepper = document.createElement("div");
  hourStepper.className = "dp-time-stepper";
  const hourInput = document.createElement("input");
  hourInput.type = "text";
  hourInput.className = "dp-time-input dp-time-hour";
  hourInput.value = String(displayHour).padStart(2, "0");
  const btnHourUp = document.createElement("button");
  btnHourUp.type = "button";
  btnHourUp.className = "dp-time-btn";
  btnHourUp.innerHTML = "+";
  const btnHourDown = document.createElement("button");
  btnHourDown.type = "button";
  btnHourDown.className = "dp-time-btn";
  btnHourDown.innerHTML = "\u2212";
  hourStepper.appendChild(btnHourDown);
  hourStepper.appendChild(hourInput);
  hourStepper.appendChild(btnHourUp);
  const sep = document.createElement("span");
  sep.className = "dp-time-sep";
  sep.textContent = ":";
  const minStepper = document.createElement("div");
  minStepper.className = "dp-time-stepper";
  const minInput = document.createElement("input");
  minInput.type = "text";
  minInput.className = "dp-time-input dp-time-minute";
  minInput.value = String(minute).padStart(2, "0");
  const btnMinUp = document.createElement("button");
  btnMinUp.type = "button";
  btnMinUp.className = "dp-time-btn";
  btnMinUp.innerHTML = "+";
  const btnMinDown = document.createElement("button");
  btnMinDown.type = "button";
  btnMinDown.className = "dp-time-btn";
  btnMinDown.innerHTML = "\u2212";
  minStepper.appendChild(btnMinDown);
  minStepper.appendChild(minInput);
  minStepper.appendChild(btnMinUp);
  const emit = () => {
    let h = parseInt(hourInput.value, 10) || 0;
    let m = parseInt(minInput.value, 10) || 0;
    if (is12h) {
      if (isPM && h < 12) h += 12;
      if (!isPM && h === 12) h = 0;
    }
    onChange(Math.max(0, Math.min(23, h)), Math.max(0, Math.min(59, m)));
  };
  btnHourUp.addEventListener("click", (e) => {
    e.stopPropagation();
    let h = parseInt(hourInput.value, 10) || 0;
    h = is12h ? h % 12 + 1 : (h + 1) % 24;
    hourInput.value = String(h).padStart(2, "0");
    emit();
  });
  btnHourDown.addEventListener("click", (e) => {
    e.stopPropagation();
    let h = parseInt(hourInput.value, 10) || 0;
    h = is12h ? h <= 1 ? 12 : h - 1 : h <= 0 ? 23 : h - 1;
    hourInput.value = String(h).padStart(2, "0");
    emit();
  });
  btnMinUp.addEventListener("click", (e) => {
    e.stopPropagation();
    let m = (parseInt(minInput.value, 10) || 0) + 5;
    if (m >= 60) m = 0;
    minInput.value = String(m).padStart(2, "0");
    emit();
  });
  btnMinDown.addEventListener("click", (e) => {
    e.stopPropagation();
    let m = (parseInt(minInput.value, 10) || 0) - 5;
    if (m < 0) m = 55;
    minInput.value = String(m).padStart(2, "0");
    emit();
  });
  container.appendChild(hourStepper);
  container.appendChild(sep);
  container.appendChild(minStepper);
  if (is12h) {
    const ampmBtn = document.createElement("button");
    ampmBtn.type = "button";
    ampmBtn.className = "dp-ampm-btn";
    ampmBtn.textContent = isPM ? "\u0628.\u0638 / PM" : "\u0642.\u0638 / AM";
    ampmBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      isPM = !isPM;
      ampmBtn.textContent = isPM ? "\u0628.\u0638 / PM" : "\u0642.\u0638 / AM";
      emit();
    });
    container.appendChild(ampmBtn);
  }
  return container;
}
function createOverlay(trigger) {
  const overlay = document.createElement("div");
  overlay.className = "dp-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.style.display = "none";
  return overlay;
}
function createPopup(container, zIndex) {
  const popup = document.createElement("div");
  popup.className = "dp-popup";
  popup.setAttribute("role", "dialog");
  popup.setAttribute("aria-modal", "true");
  popup.setAttribute("aria-label", "Date picker");
  popup.setAttribute("tabindex", "-1");
  popup.style.zIndex = String(zIndex);
  popup.style.display = "none";
  const handle = document.createElement("div");
  handle.className = "dp-drag-handle";
  popup.appendChild(handle);
  container.appendChild(popup);
  return popup;
}
function applyTheme(el, theme = "light") {
  el.classList.remove(
    "dp-theme-light",
    "dp-theme-dark",
    "dp-theme-auto",
    "dp-theme-material",
    "dp-theme-ios",
    "dp-theme-glass"
  );
  el.classList.add(`dp-theme-${theme}`);
}
function applyDesign(el, design = "default") {
  el.classList.remove(
    "dp-design-default",
    "dp-design-rounded",
    "dp-design-minimal",
    "dp-design-bordered",
    "dp-design-compact"
  );
  el.classList.add(`dp-design-${design}`);
}
function applyLayout(el, layout = "popup") {
  el.classList.remove("dp-layout-popup", "dp-layout-inline", "dp-layout-multi-month");
  el.classList.add(`dp-layout-${layout}`);
}
function applyDirection(popup, direction) {
  popup.setAttribute("dir", direction);
  popup.style.direction = direction;
  if (direction === "rtl") {
    popup.classList.add("dp-rtl");
  } else {
    popup.classList.remove("dp-rtl");
  }
}

// src/DatePicker.ts
var DatePicker = class {
  constructor(el, options = {}) {
    this.container = null;
    this.inputEl = null;
    this.clearBtnEl = null;
    this.popup = null;
    this.overlay = null;
    this.liveRegion = null;
    this.destroyed = false;
    // View Mode: 'days' | 'months' | 'years'
    this.currentView = "days";
    this.focusedCellIndex = 0;
    this.options = { ...options };
    this.events = new EventEmitter();
    this.state = new StateManager();
    this.initContainer(el);
    this.initOptions();
    this.initLocale();
    this.render();
    this.attachEvents();
    const isInline = this.state.getState().inline || this.state.getState().layout === "inline";
    if (!isInline) {
      this.inputEl?.addEventListener("click", () => this.toggle());
      this.inputEl?.addEventListener("focus", () => this.open());
    } else {
      this.open();
    }
  }
  initContainer(el) {
    if (typeof el === "string") {
      const element = document.querySelector(el);
      if (!element) {
        throw new Error(`Element not found: ${el}`);
      }
      this.container = element;
    } else {
      this.container = el;
    }
  }
  initOptions() {
    const opts = this.options;
    if (opts.mode) this.state.setMode(opts.mode);
    if (opts.calendar) this.state.setCalendar(opts.calendar);
    if (opts.calendarSwitcher !== void 0) this.state.setState({ calendarSwitcher: opts.calendarSwitcher });
    if (opts.showTime !== void 0) this.state.setShowTime(opts.showTime);
    if (opts.timeFormat) this.state.setTimeFormat(opts.timeFormat);
    if (opts.theme) this.state.setTheme(opts.theme);
    if (opts.design) this.state.setDesign(opts.design);
    if (opts.layout) this.state.setLayout(opts.layout);
    if (opts.inline !== void 0) {
      this.state.setInline(opts.inline);
      if (opts.inline) this.state.setLayout("inline");
    }
    if (opts.placeholder) this.state.setPlaceholder(opts.placeholder);
    if (opts.zIndex) this.state.setZIndex(opts.zIndex);
    if (opts.format) this.state.setFormat(opts.format);
    if (opts.pattern) this.state.setPattern(opts.pattern);
    if (opts.firstDayOfWeek !== void 0) {
      this.state.setFirstDayOfWeek(opts.firstDayOfWeek);
    }
    if (opts.hijriAdjustment !== void 0) {
      this.state.setState({ hijriAdjustment: opts.hijriAdjustment });
    }
    if (opts.hijriPreset) {
      this.state.setState({ hijriPreset: opts.hijriPreset });
    }
    if (opts.numeralSystem) {
      this.state.setNumeralSystem(opts.numeralSystem);
    }
    if (opts.value) {
      this.setValueInternal(opts.value);
    }
    if (opts.minDate) {
      const d = this.parseDate(opts.minDate);
      if (d) this.state.setMinDate(d.toDate());
    }
    if (opts.maxDate) {
      const d = this.parseDate(opts.maxDate);
      if (d) this.state.setMaxDate(d.toDate());
    }
    const disabledDates = /* @__PURE__ */ new Set();
    let disabledDateFn = null;
    if (Array.isArray(opts.disabledDates)) {
      opts.disabledDates.forEach((d) => {
        if (typeof d === "string") disabledDates.add(d);
        else if (d instanceof SmartDate) disabledDates.add(d.format("Y-m-d"));
        else if (d instanceof Date) disabledDates.add(new SmartDate(d).format("Y-m-d"));
      });
    } else if (typeof opts.disabledDates === "function") {
      disabledDateFn = opts.disabledDates;
    }
    this.state.setDisabledDates(disabledDates, disabledDateFn, opts.disabledWeekdays || []);
  }
  initLocale() {
    const opts = this.options;
    const defaultLocale = opts.calendar === "jalali" ? "fa-IR" : opts.calendar === "hijri" ? "ar-SA" : "en-US";
    const loc = opts.locale || defaultLocale;
    this.state.setLocale(typeof loc === "string" ? loc : loc.code || defaultLocale);
  }
  getLocaleConfig() {
    const s = this.state.getState();
    const localeOpt = this.options.locale;
    const base = getLocale(s.locale);
    if (typeof localeOpt === "object") {
      return mergeLocale(base, localeOpt);
    }
    return base;
  }
  setValueInternal(v) {
    if (!v) {
      this.state.setSelectedDates([]);
      return;
    }
    const parseToSmart = (item) => {
      if (item instanceof SmartDate) return item;
      if (item instanceof Date) return new SmartDate(item);
      if (typeof item === "string") return this.parseDate(item);
      return null;
    };
    if (Array.isArray(v)) {
      const parsed = v.map(parseToSmart).filter((d) => d !== null);
      if (parsed.length > 0) {
        this.state.setSelectedSmartDates(parsed);
        this.state.setViewDate(parsed[0].toDate());
      }
    } else {
      const single = parseToSmart(v);
      if (single) {
        this.state.setSelectedSmartDates([single]);
        this.state.setViewDate(single.toDate());
      }
    }
  }
  render() {
    if (!this.container || this.destroyed) return;
    this.container.innerHTML = "";
    this.container.classList.add("dp-container");
    const s = this.state.getState();
    const locale = this.getLocaleConfig();
    const isInline = s.inline || s.layout === "inline";
    if (!isInline) {
      const wrapper = document.createElement("div");
      wrapper.className = "dp-input-wrapper";
      const input = document.createElement("input");
      input.type = "text";
      input.className = "dp-input";
      input.placeholder = s.placeholder;
      input.readOnly = true;
      const formattedVal = this.getValue();
      if (formattedVal) {
        input.value = Array.isArray(formattedVal) ? formattedVal.join(", ") : formattedVal;
      }
      this.inputEl = input;
      input.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggle();
      });
      wrapper.appendChild(input);
      const iconBtn = document.createElement("span");
      iconBtn.className = "dp-input-icon";
      iconBtn.innerHTML = CALENDAR_ICON_SVG;
      iconBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggle();
      });
      wrapper.appendChild(iconBtn);
      const clearBtn = document.createElement("button");
      clearBtn.type = "button";
      clearBtn.className = "dp-input-clear";
      clearBtn.innerHTML = "&times;";
      clearBtn.style.display = formattedVal ? "flex" : "none";
      clearBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.clear();
      });
      this.clearBtnEl = clearBtn;
      wrapper.appendChild(clearBtn);
      this.container.appendChild(wrapper);
    }
    if (isInline) {
      const wrapper = document.createElement("div");
      wrapper.className = "dp-inline";
      this.container.appendChild(wrapper);
    }
    if (!isInline) {
      this.overlay = createOverlay(this.container);
      this.overlay.addEventListener("click", () => this.close());
      this.container.appendChild(this.overlay);
    }
    this.popup = createPopup(this.container, s.zIndex);
    applyTheme(this.popup, s.theme);
    applyDesign(this.popup, s.design);
    applyLayout(this.popup, s.layout);
    applyDirection(this.popup, locale.direction);
    this.liveRegion = document.createElement("div");
    this.liveRegion.setAttribute("aria-live", "polite");
    this.liveRegion.setAttribute("aria-atomic", "true");
    this.liveRegion.className = "sr-only";
    this.liveRegion.style.position = "absolute";
    this.liveRegion.style.width = "1px";
    this.liveRegion.style.height = "1px";
    this.liveRegion.style.overflow = "hidden";
    this.popup.appendChild(this.liveRegion);
    this.renderCalendar();
    if (isInline) {
      this.state.setIsOpen(true);
      this.events.emit("open", {});
    } else if (s.isOpen) {
      this.popup.style.display = "block";
      this.popup.classList.add("dp-open");
      if (this.overlay) {
        this.overlay.style.display = "block";
        this.overlay.classList.add("dp-open");
      }
    }
  }
  renderCalendar() {
    if (!this.popup) return;
    const s = this.state.getState();
    const locale = this.getLocaleConfig();
    const dragHandle = this.popup.querySelector(".dp-drag-handle");
    this.popup.innerHTML = "";
    if (dragHandle) this.popup.appendChild(dragHandle);
    if (this.liveRegion) this.popup.appendChild(this.liveRegion);
    if (s.calendarSwitcher) {
      const switcher = createCalendarSwitcher(s.calendar, (newCal) => {
        this.switchCalendar(newCal);
      });
      this.popup.appendChild(switcher);
    }
    if (this.currentView === "months") {
      this.renderMonthsView();
      return;
    }
    if (this.currentView === "years") {
      this.renderYearsView();
      return;
    }
    const monthsToRender = s.layout === "multi-month" ? s.monthsCount || 2 : 1;
    const monthsWrapper = document.createElement("div");
    monthsWrapper.className = monthsToRender > 1 ? "dp-multi-month-container" : "dp-single-month-container";
    for (let mOffset = 0; mOffset < monthsToRender; mOffset++) {
      let activeMonth = s.viewMonth + mOffset;
      let activeYear = s.viewYear;
      while (activeMonth > 11) {
        activeMonth -= 12;
        activeYear++;
      }
      const monthSection = document.createElement("div");
      monthSection.className = "dp-month-pane";
      const header = document.createElement("div");
      header.className = "dp-header";
      const prevBtn = document.createElement("button");
      prevBtn.type = "button";
      prevBtn.className = "dp-nav-btn dp-nav-prev";
      prevBtn.innerHTML = CHEVRON_LEFT_SVG;
      prevBtn.setAttribute("aria-label", locale.navPrev || "Previous Month");
      prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.navigateMonth(-1);
      });
      const monthYearTitle = document.createElement("div");
      monthYearTitle.className = "dp-month-year";
      const monthBtn = document.createElement("button");
      monthBtn.type = "button";
      monthBtn.className = "dp-title-btn dp-title-month";
      const monthNames = locale.months;
      const monthName = monthNames[activeMonth + 1] || monthNames[activeMonth] || `Month ${activeMonth + 1}`;
      monthBtn.textContent = monthName;
      monthBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.currentView = "months";
        this.renderCalendar();
      });
      const yearBtn = document.createElement("button");
      yearBtn.type = "button";
      yearBtn.className = "dp-title-btn dp-title-year";
      yearBtn.textContent = toLocalDigits(activeYear, s.numeralSystem);
      yearBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.currentView = "years";
        this.renderCalendar();
      });
      monthYearTitle.appendChild(monthBtn);
      monthYearTitle.appendChild(yearBtn);
      const nextBtn = document.createElement("button");
      nextBtn.type = "button";
      nextBtn.className = "dp-nav-btn dp-nav-next";
      nextBtn.innerHTML = CHEVRON_RIGHT_SVG;
      nextBtn.setAttribute("aria-label", locale.navNext || "Next Month");
      nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.navigateMonth(1);
      });
      if (mOffset === 0) header.appendChild(prevBtn);
      else {
        const spacer = document.createElement("span");
        spacer.style.width = "32px";
        header.appendChild(spacer);
      }
      header.appendChild(monthYearTitle);
      if (mOffset === monthsToRender - 1) header.appendChild(nextBtn);
      else {
        const spacer = document.createElement("span");
        spacer.style.width = "32px";
        header.appendChild(spacer);
      }
      monthSection.appendChild(header);
      const weekdayHeaders = createWeekdayHeaders(locale);
      const weekdayRow = document.createElement("div");
      weekdayRow.className = "dp-weekdays";
      weekdayHeaders.forEach((h) => weekdayRow.appendChild(h));
      monthSection.appendChild(weekdayRow);
      const cells = generateMonthDays(
        activeYear,
        activeMonth,
        s.selectedDates,
        s.minDate,
        s.maxDate,
        s.disabledDates,
        s.disabledDateFn,
        s.locale,
        s.calendar,
        s.disabledWeekdays,
        s.mode
      );
      const grid = document.createElement("div");
      grid.className = "dp-grid";
      grid.setAttribute("role", "grid");
      cells.forEach((cell, idx) => {
        const btn = createCalendarCellElement(cell, locale, s.numeralSystem);
        btn.setAttribute("tabindex", cell.isSelected || idx === 0 && !cell.isDisabled ? "0" : "-1");
        btn.addEventListener("click", () => this.selectDate(cell.date, cell.isDisabled));
        grid.appendChild(btn);
      });
      monthSection.appendChild(grid);
      monthsWrapper.appendChild(monthSection);
    }
    this.popup.appendChild(monthsWrapper);
    if (this.liveRegion) {
      const monthNames = locale.months;
      const mName = monthNames[s.viewMonth + 1] || monthNames[s.viewMonth];
      this.liveRegion.textContent = `${mName} ${s.viewYear}`;
    }
    if (s.showTime) {
      const timePicker = createTimePicker(s.hour, s.minute, s.timeFormat, (h, m) => {
        this.state.setTime(h, m);
        if (s.selectedSmartDates.length > 0) {
          s.selectedSmartDates[0].setHour(h).setMinute(m);
          this.state.setSelectedSmartDates([...s.selectedSmartDates]);
        }
        this.updateInput();
        this.events.emit("change", { value: this.getValue(), smartDate: this.getSmartDate() });
      });
      this.popup.appendChild(timePicker);
    }
    const footer = document.createElement("div");
    footer.className = "dp-footer";
    const todayBtn = document.createElement("button");
    todayBtn.type = "button";
    todayBtn.className = "dp-btn dp-btn-today";
    todayBtn.textContent = locale.today;
    todayBtn.addEventListener("click", () => this.goToToday());
    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "dp-btn dp-btn-clear";
    clearBtn.textContent = locale.clear;
    clearBtn.addEventListener("click", () => this.clear());
    footer.appendChild(todayBtn);
    footer.appendChild(clearBtn);
    this.popup.appendChild(footer);
  }
  // Month Selection Grid View
  renderMonthsView() {
    if (!this.popup) return;
    const s = this.state.getState();
    const locale = this.getLocaleConfig();
    const header = document.createElement("div");
    header.className = "dp-header";
    const backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "dp-nav-btn";
    backBtn.innerHTML = CHEVRON_LEFT_SVG;
    backBtn.addEventListener("click", () => {
      this.currentView = "days";
      this.renderCalendar();
    });
    const title = document.createElement("span");
    title.className = "dp-month-year";
    title.textContent = `\u0627\u0646\u062A\u062E\u0627\u0628 \u0645\u0627\u0647 (${toLocalDigits(s.viewYear, s.numeralSystem)})`;
    header.appendChild(backBtn);
    header.appendChild(title);
    this.popup.appendChild(header);
    const grid = document.createElement("div");
    grid.className = "dp-view-grid";
    const months = locale.months.slice(1);
    months.forEach((mName, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "dp-view-item";
      if (idx === s.viewMonth) {
        btn.classList.add("dp-view-item--selected");
      }
      btn.textContent = mName;
      btn.addEventListener("click", () => {
        this.state.setViewYearMonth(s.viewYear, idx);
        this.currentView = "days";
        this.renderCalendar();
      });
      grid.appendChild(btn);
    });
    this.popup.appendChild(grid);
  }
  // Decade / Years Selection Grid View
  renderYearsView() {
    if (!this.popup) return;
    const s = this.state.getState();
    const startYear = Math.floor(s.viewYear / 12) * 12;
    const endYear = startYear + 11;
    const header = document.createElement("div");
    header.className = "dp-header";
    const prevDecadeBtn = document.createElement("button");
    prevDecadeBtn.type = "button";
    prevDecadeBtn.className = "dp-nav-btn";
    prevDecadeBtn.innerHTML = CHEVRON_LEFT_SVG;
    prevDecadeBtn.addEventListener("click", () => {
      this.state.setViewYearMonth(s.viewYear - 12, s.viewMonth);
      this.renderCalendar();
    });
    const title = document.createElement("span");
    title.className = "dp-month-year";
    title.textContent = `${toLocalDigits(startYear, s.numeralSystem)} \u2013 ${toLocalDigits(endYear, s.numeralSystem)}`;
    const nextDecadeBtn = document.createElement("button");
    nextDecadeBtn.type = "button";
    nextDecadeBtn.className = "dp-nav-btn";
    nextDecadeBtn.innerHTML = CHEVRON_RIGHT_SVG;
    nextDecadeBtn.addEventListener("click", () => {
      this.state.setViewYearMonth(s.viewYear + 12, s.viewMonth);
      this.renderCalendar();
    });
    header.appendChild(prevDecadeBtn);
    header.appendChild(title);
    header.appendChild(nextDecadeBtn);
    this.popup.appendChild(header);
    const grid = document.createElement("div");
    grid.className = "dp-view-grid";
    for (let y = startYear; y <= endYear; y++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "dp-view-item";
      if (y === s.viewYear) {
        btn.classList.add("dp-view-item--selected");
      }
      btn.textContent = toLocalDigits(y, s.numeralSystem);
      btn.addEventListener("click", () => {
        this.state.setViewYearMonth(y, s.viewMonth);
        this.currentView = "months";
        this.renderCalendar();
      });
      grid.appendChild(btn);
    }
    this.popup.appendChild(grid);
  }
  selectDate(date, isDisabled) {
    if (isDisabled) {
      this.events.emit("error", { message: "Date is disabled" });
      return;
    }
    const s = this.state.getState();
    const smart = new SmartDate(date, s.hijriAdjustment, s.hijriPreset);
    if (s.showTime) {
      smart.setHour(s.hour).setMinute(s.minute).setSecond(s.second);
    }
    let selected = [...s.selectedDates];
    let selectedSmarts = [...s.selectedSmartDates];
    if (s.mode === "single") {
      selected = [smart.toDate()];
      selectedSmarts = [smart];
    } else if (s.mode === "multiple") {
      const idx = selected.findIndex((d) => isSameDay(d, date));
      if (idx >= 0) {
        selected.splice(idx, 1);
        selectedSmarts.splice(idx, 1);
      } else {
        selected.push(smart.toDate());
        selectedSmarts.push(smart);
      }
    } else if (s.mode === "range") {
      if (selected.length === 0 || selected.length === 2) {
        selected = [smart.toDate()];
        selectedSmarts = [smart];
      } else if (selected.length === 1) {
        const start = selected[0] < smart.toDate() ? selected[0] : smart.toDate();
        const end = selected[0] < smart.toDate() ? smart.toDate() : selected[0];
        selected = [start, end];
        selectedSmarts = [
          new SmartDate(start, s.hijriAdjustment, s.hijriPreset),
          new SmartDate(end, s.hijriAdjustment, s.hijriPreset)
        ];
      }
    }
    this.state.setSelectedDates(selected);
    this.state.setSelectedSmartDates(selectedSmarts);
    this.renderCalendar();
    this.updateInput();
    const isInline = s.inline || s.layout === "inline";
    if (s.mode === "single" || s.mode === "range" && selected.length === 2) {
      this.events.emit("select", { date: smart.toDate(), smartDate: smart, value: this.getValue() });
      this.events.emit("change", { value: this.getValue(), smartDate: this.getSmartDate() });
      if (!isInline) {
        this.close();
      }
    } else if (s.mode === "multiple") {
      this.events.emit("select", { date: smart.toDate(), smartDate: smart, value: this.getValue() });
      this.events.emit("change", { value: this.getValue(), smartDate: this.getSmartDate() });
    }
  }
  updateInput() {
    if (!this.inputEl) return;
    const val = this.getValue();
    if (val) {
      this.inputEl.value = Array.isArray(val) ? val.join(", ") : val;
      if (this.clearBtnEl) this.clearBtnEl.style.display = "flex";
    } else {
      this.inputEl.value = "";
      if (this.clearBtnEl) this.clearBtnEl.style.display = "none";
    }
  }
  navigateMonth(delta) {
    const s = this.state.getState();
    let month = s.viewMonth + delta;
    let year = s.viewYear;
    while (month > 11) {
      month -= 12;
      year++;
    }
    while (month < 0) {
      month += 12;
      year--;
    }
    this.state.setViewYearMonth(year, month);
    this.renderCalendar();
    this.events.emit("navigate", { year, month, calendar: s.calendar });
  }
  goToToday() {
    const now = /* @__PURE__ */ new Date();
    this.state.setViewDate(now);
    this.currentView = "days";
    this.renderCalendar();
  }
  switchCalendar(newCal) {
    const wasOpen = this.state.getState().isOpen;
    this.state.setCalendar(newCal);
    if (newCal === "jalali") {
      this.state.setLocale("fa-IR");
      this.state.setNumeralSystem("arabext");
      this.state.setFirstDayOfWeek(6);
    } else if (newCal === "hijri") {
      this.state.setLocale("ar-SA");
      this.state.setNumeralSystem("arab");
      this.state.setFirstDayOfWeek(6);
    } else {
      this.state.setLocale("en-US");
      this.state.setNumeralSystem("latn");
      this.state.setFirstDayOfWeek(0);
    }
    this.currentView = "days";
    const locale = this.getLocaleConfig();
    if (this.popup) {
      applyDirection(this.popup, locale.direction);
    }
    if (this.inputEl) {
      this.inputEl.dir = locale.direction;
    }
    this.renderCalendar();
    this.updateInput();
    if (wasOpen && this.popup) {
      this.popup.style.display = "block";
      this.popup.classList.add("dp-open");
      if (this.overlay) {
        this.overlay.style.display = "block";
        this.overlay.classList.add("dp-open");
      }
    }
    this.events.emit("calendar-change", { calendar: newCal });
    if (this.state.getState().selectedSmartDates.length > 0) {
      this.events.emit("change", { value: this.getValue(), smartDate: this.getSmartDate() });
    }
  }
  // Keyboard navigation for WAI-ARIA
  attachEvents() {
    if (this.overlay) {
      this.overlay.addEventListener("click", () => this.close());
    }
    document.addEventListener("keydown", (e) => {
      if (this.destroyed || !this.state.getState().isOpen) return;
      if (e.key === "Escape") {
        this.close();
        return;
      }
      if (this.currentView !== "days" || !this.popup) return;
      const cells = Array.from(this.popup.querySelectorAll(".dp-day"));
      if (cells.length === 0) return;
      const s = this.state.getState();
      const isRTL = s.locale.startsWith("fa") || s.locale.startsWith("ar");
      let currentFocusIndex = cells.findIndex((btn) => btn === document.activeElement);
      if (currentFocusIndex === -1) currentFocusIndex = 0;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        const next = isRTL ? currentFocusIndex - 1 : currentFocusIndex + 1;
        if (next >= 0 && next < cells.length) cells[next].focus();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const next = isRTL ? currentFocusIndex + 1 : currentFocusIndex - 1;
        if (next >= 0 && next < cells.length) cells[next].focus();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = currentFocusIndex + 7;
        if (next < cells.length) cells[next].focus();
        else this.navigateMonth(1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const next = currentFocusIndex - 7;
        if (next >= 0) cells[next].focus();
        else this.navigateMonth(-1);
      } else if (e.key === "PageDown") {
        e.preventDefault();
        this.navigateMonth(e.shiftKey ? 12 : 1);
      } else if (e.key === "PageUp") {
        e.preventDefault();
        this.navigateMonth(e.shiftKey ? -12 : -1);
      }
    });
  }
  open() {
    if (this.destroyed || this.state.getState().isOpen) return;
    this.state.setIsOpen(true);
    if (this.popup) {
      this.popup.style.display = "block";
      requestAnimationFrame(() => {
        this.popup?.classList.add("dp-open");
      });
    }
    if (this.overlay) {
      this.overlay.style.display = "block";
      requestAnimationFrame(() => {
        this.overlay?.classList.add("dp-open");
      });
    }
    this.events.emit("open", {});
  }
  close() {
    if (this.destroyed || !this.state.getState().isOpen) return;
    this.state.setIsOpen(false);
    if (this.popup) {
      this.popup.classList.remove("dp-open");
      this.popup.style.display = "none";
    }
    if (this.overlay) {
      this.overlay.classList.remove("dp-open");
      this.overlay.style.display = "none";
    }
    this.events.emit("close", {});
  }
  toggle() {
    if (this.state.getState().isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.close();
    this.events.destroy();
    if (this.container) {
      this.container.innerHTML = "";
    }
  }
  getValue() {
    const s = this.state.getState();
    if (s.selectedSmartDates.length === 0) return null;
    const pattern = s.pattern || s.format || (s.calendar === "jalali" ? "Y/m/d" : "Y-m-d");
    if (s.mode === "single") {
      return this.formatDate(s.selectedSmartDates[0], pattern, s.calendar);
    }
    return s.selectedSmartDates.map((d) => this.formatDate(d, pattern, s.calendar));
  }
  getSmartDate() {
    const s = this.state.getState();
    if (s.selectedSmartDates.length === 0) return null;
    if (s.mode === "single") {
      return s.selectedSmartDates[0];
    }
    if (s.mode === "range") {
      if (s.selectedSmartDates.length >= 2) {
        return { start: s.selectedSmartDates[0], end: s.selectedSmartDates[1] };
      }
      return s.selectedSmartDates[0];
    }
    return s.selectedSmartDates;
  }
  setValue(v) {
    this.setValueInternal(v);
    this.renderCalendar();
    this.updateInput();
    this.events.emit("change", { value: this.getValue(), smartDate: this.getSmartDate() });
  }
  clear() {
    this.state.setSelectedDates([]);
    this.state.setSelectedSmartDates([]);
    this.renderCalendar();
    this.updateInput();
    this.events.emit("clear", {});
    this.events.emit("change", { value: null, smartDate: null });
  }
  setLocale(l) {
    this.state.setLocale(l);
    this.render();
  }
  formatDate(d, pattern, calendar) {
    const s = this.state.getState();
    const cal = calendar || s.calendar;
    const pat = pattern || s.pattern || s.format || "Y/m/d";
    const smart = d instanceof SmartDate ? d : new SmartDate(d);
    return smart.format(pat, cal);
  }
  parseDate(s, pattern, calendar) {
    const st = this.state.getState();
    const cal = calendar || st.calendar;
    const pat = pattern || st.pattern;
    try {
      return SmartDateFormat.parse(s, pat, cal);
    } catch {
      return null;
    }
  }
  on(event, cb) {
    return this.events.on(event, cb);
  }
  update(options) {
    this.options = { ...this.options, ...options };
    this.initOptions();
    this.initLocale();
    this.render();
    if (this.state.getState().selectedSmartDates.length > 0) {
      this.events.emit("change", { value: this.getValue(), smartDate: this.getSmartDate() });
    }
  }
};

// src/convert.ts
function toJDN(d, hijriAdjustment = 0) {
  switch (d.calendar) {
    case "gregorian":
      return gregorianToJDN(d.year, d.month, d.day);
    case "jalali":
      return jalaliToJDN(d.year, d.month, d.day);
    case "hijri":
      return hijriToJDN(d.year, d.month, d.day, hijriAdjustment);
  }
}
function fromJDN(jdn, calendar, hijriAdjustment = 0) {
  switch (calendar) {
    case "gregorian": {
      const { year, month, day } = jdnToGregorian(jdn);
      return { year, month, day, calendar: "gregorian" };
    }
    case "jalali": {
      const { year, month, day } = jdnToJalali(jdn);
      return { year, month, day, calendar: "jalali" };
    }
    case "hijri": {
      const { year, month, day } = jdnToHijri(jdn, hijriAdjustment);
      return { year, month, day, calendar: "hijri" };
    }
  }
}
function toGregorian(d, hijriAdjustment = 0) {
  const jdn = toJDN(d, hijriAdjustment);
  const { year, month, day } = jdnToGregorian(jdn);
  return { year, month, day, calendar: "gregorian" };
}
function toJalali(d, hijriAdjustment = 0) {
  const jdn = toJDN(d, hijriAdjustment);
  const { year, month, day } = jdnToJalali(jdn);
  return { year, month, day, calendar: "jalali" };
}
function toHijri(d, hijriAdjustment = 0) {
  const jdn = toJDN(d, hijriAdjustment);
  const { year, month, day } = jdnToHijri(jdn, hijriAdjustment);
  return { year, month, day, calendar: "hijri" };
}
function isLeapYear(calendar, year) {
  switch (calendar) {
    case "gregorian":
      return isGregorianLeap(year);
    case "jalali":
      return isJalaliLeap(year);
    case "hijri":
      return isHijriLeap(year);
  }
}
function daysInMonth(calendar, year, month) {
  switch (calendar) {
    case "gregorian":
      return gregorianMonthLength(year, month);
    case "jalali":
      return jalaliMonthLength(year, month);
    case "hijri":
      return hijriMonthLength(year, month);
  }
}
function daysInYear(calendar, year) {
  switch (calendar) {
    case "gregorian":
      return gregorianYearLength(year);
    case "jalali":
      return jalaliYearLength(year);
    case "hijri":
      return hijriYearLength(year);
  }
}
function todayIn(calendar, hijriAdjustment = 0) {
  const now = /* @__PURE__ */ new Date();
  const gy = now.getFullYear();
  const gm = now.getMonth() + 1;
  const gd = now.getDate();
  const jdn = gregorianToJDN(gy, gm, gd);
  return fromJDN(jdn, calendar, hijriAdjustment);
}
function compareCalendarDates(a, b, hijriAdjustment = 0) {
  const jdnA = toJDN(a, hijriAdjustment);
  const jdnB = toJDN(b, hijriAdjustment);
  if (jdnA < jdnB) return -1;
  if (jdnA > jdnB) return 1;
  return 0;
}
function isSameDay2(a, b, hijriAdjustment = 0) {
  return compareCalendarDates(a, b, hijriAdjustment) === 0;
}
function fromJSDate(jsDate, calendar, hijriAdjustment = 0) {
  const jdn = gregorianToJDN(jsDate.getFullYear(), jsDate.getMonth() + 1, jsDate.getDate());
  return fromJDN(jdn, calendar, hijriAdjustment);
}
function toJSDate(d, hijriAdjustment = 0) {
  const g = toGregorian(d, hijriAdjustment);
  return new Date(g.year, g.month - 1, g.day);
}
function addDays(d, n, hijriAdjustment = 0) {
  return fromJDN(toJDN(d, hijriAdjustment) + n, d.calendar, hijriAdjustment);
}
function addMonths(d, n, hijriAdjustment = 0) {
  let year = d.year;
  let month = d.month + n;
  while (month > 12) {
    month -= 12;
    year++;
  }
  while (month < 1) {
    month += 12;
    year--;
  }
  const maxDay = daysInMonth(d.calendar, year, month);
  const day = Math.min(d.day, maxDay);
  return { year, month, day, calendar: d.calendar };
}
function addYears(d, n, hijriAdjustment = 0) {
  const year = d.year + n;
  const maxDay = daysInMonth(d.calendar, year, d.month);
  const day = Math.min(d.day, maxDay);
  return { year, month: d.month, day, calendar: d.calendar };
}

export { BREAKS, DEFAULT_PATTERNS, DatePicker, HIJRI_EPOCH_JDN, HIJRI_LEAP_YEARS, InvalidDateFormatError, SmartDate, SmartDateFormat, addDays, addMonths, addYears, compareCalendarDates, daysInMonth, daysInYear, formatDate, fromJDN, fromJSDate, getLocale, gregorianDayOfWeek, gregorianDayOfYear, gregorianMonthLength, gregorianToJDN, gregorianYearLength, hijriDayOfWeek, hijriMonthLength, hijriToJDN, hijriYearLength, isGregorianLeap, isHijriLeap, isJalaliLeap, isLeapYear, isSameDay2 as isSameDay, jalCal, jalaliDayOfWeek, jalaliDayOfYear, jalaliMonthLength, jalaliToJDN, jalaliYearLength, jdnToGregorian, jdnToHijri, jdnToJalali, mergeLocale, normalizeDigits, parseDate, resolveHijriAdjustment, toGregorian, toHijri, toJDN, toJSDate, toJalali, todayIn };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map