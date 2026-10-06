/**
 * SmartDate.ts — Unified multi-calendar date class (PersianDate API style).
 *
 * Keeps Jalali, Hijri, and Gregorian representations synchronized via the
 * Julian Day Number (JDN) hub. Lazy computation & caching.
 */

import type { CalendarType, HijriPreset } from './types';
import {
  gregorianToJDN,
  jdnToGregorian,
  isGregorianLeap,
  gregorianMonthLength,
  gregorianDayOfYear,
  gregorianDayOfWeek,
} from './calendars/gregorian';
import {
  jalaliToJDN,
  jdnToJalali,
  isJalaliLeap,
  jalaliMonthLength,
  jalaliDayOfYear,
  jalaliDayOfWeek,
} from './calendars/jalali';
import {
  hijriToJDN,
  jdnToHijri,
  isHijriLeap,
  hijriMonthLength,
  hijriDayOfWeek,
  resolveHijriAdjustment,
} from './calendars/hijri';
import { SmartDateFormat } from './SmartDateFormat';

export interface CalendarComponents {
  year: number;
  month: number;
  day: number;
}

export class SmartDate {
  private _timestamp: number;
  private _hijriAdjustment: number;
  private _hijriPreset: HijriPreset;

  // Cached calendar views
  private _cachedJDN: number | null = null;
  private _cachedGrg: CalendarComponents | null = null;
  private _cachedSh: CalendarComponents | null = null;
  private _cachedHj: CalendarComponents | null = null;
  private _cachedTime: { hour: number; minute: number; second: number; ms: number } | null = null;

  constructor(
    input?: number | Date | SmartDate | string,
    hijriAdjustment = 0,
    hijriPreset: HijriPreset = 'tabular'
  ) {
    this._hijriPreset = hijriPreset;
    this._hijriAdjustment = resolveHijriAdjustment(hijriPreset, hijriAdjustment);

    if (input instanceof SmartDate) {
      this._timestamp = input._timestamp;
      this._hijriAdjustment = input._hijriAdjustment;
      this._hijriPreset = input._hijriPreset;
    } else if (input instanceof Date) {
      this._timestamp = input.getTime();
    } else if (typeof input === 'number') {
      this._timestamp = input;
    } else if (typeof input === 'string') {
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

  static fromTimestamp(ts: number, hijriAdjustment = 0, preset: HijriPreset = 'tabular'): SmartDate {
    return new SmartDate(ts, hijriAdjustment, preset);
  }

  static fromDate(d: Date, hijriAdjustment = 0, preset: HijriPreset = 'tabular'): SmartDate {
    return new SmartDate(d, hijriAdjustment, preset);
  }

  static now(hijriAdjustment = 0, preset: HijriPreset = 'tabular'): SmartDate {
    return new SmartDate(Date.now(), hijriAdjustment, preset);
  }

  // ---------------------------------------------------------------------------
  // Internal Cache & Sync
  // ---------------------------------------------------------------------------

  private invalidateCache(): void {
    this._cachedJDN = null;
    this._cachedGrg = null;
    this._cachedSh = null;
    this._cachedHj = null;
    this._cachedTime = null;
  }

  private getTimeComponents() {
    if (!this._cachedTime) {
      const d = new Date(this._timestamp);
      this._cachedTime = {
        hour: d.getHours(),
        minute: d.getMinutes(),
        second: d.getSeconds(),
        ms: d.getMilliseconds(),
      };
    }
    return this._cachedTime;
  }

  private getGrgComponents(): CalendarComponents {
    if (!this._cachedGrg) {
      const d = new Date(this._timestamp);
      this._cachedGrg = {
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        day: d.getDate(),
      };
    }
    return this._cachedGrg;
  }

  private getJDN(): number {
    if (this._cachedJDN === null) {
      const g = this.getGrgComponents();
      this._cachedJDN = gregorianToJDN(g.year, g.month, g.day);
    }
    return this._cachedJDN;
  }

  private getShComponents(): CalendarComponents {
    if (!this._cachedSh) {
      const jdn = this.getJDN();
      this._cachedSh = jdnToJalali(jdn);
    }
    return this._cachedSh;
  }

  private getHjComponents(): CalendarComponents {
    if (!this._cachedHj) {
      const jdn = this.getJDN();
      this._cachedHj = jdnToHijri(jdn, this._hijriAdjustment);
    }
    return this._cachedHj;
  }

  private updateFromGrg(gy: number, gm: number, gd: number): void {
    const time = this.getTimeComponents();
    const d = new Date(gy, gm - 1, gd, time.hour, time.minute, time.second, time.ms);
    this._timestamp = d.getTime();
    this.invalidateCache();
  }

  private updateFromJDN(jdn: number): void {
    const g = jdnToGregorian(jdn);
    this.updateFromGrg(g.year, g.month, g.day);
  }

  // ---------------------------------------------------------------------------
  // Init Methods
  // ---------------------------------------------------------------------------

  initGrgDate(): void {
    this.invalidateCache();
    this.getGrgComponents();
  }

  initJalaliDate(): void {
    this.invalidateCache();
    this.getShComponents();
  }

  initHijriDate(): void {
    this.invalidateCache();
    this.getHjComponents();
  }

  // ---------------------------------------------------------------------------
  // Getters — Jalali (شمسی)
  // ---------------------------------------------------------------------------

  getShYear(): number {
    return this.getShComponents().year;
  }

  getShMonth(): number {
    return this.getShComponents().month;
  }

  getShDay(): number {
    return this.getShComponents().day;
  }

  // ---------------------------------------------------------------------------
  // Getters — Hijri (قمری)
  // ---------------------------------------------------------------------------

  getHjYear(): number {
    return this.getHjComponents().year;
  }

  getHjMonth(): number {
    return this.getHjComponents().month;
  }

  getHjDay(): number {
    return this.getHjComponents().day;
  }

  // ---------------------------------------------------------------------------
  // Getters — Gregorian (میلادی)
  // ---------------------------------------------------------------------------

  getGrgYear(): number {
    return this.getGrgComponents().year;
  }

  getGrgMonth(): number {
    return this.getGrgComponents().month;
  }

  getGrgDay(): number {
    return this.getGrgComponents().day;
  }

  // ---------------------------------------------------------------------------
  // Getters — Time
  // ---------------------------------------------------------------------------

  getHour(): number {
    return this.getTimeComponents().hour;
  }

  getMinute(): number {
    return this.getTimeComponents().minute;
  }

  getSecond(): number {
    return this.getTimeComponents().second;
  }

  getMillisecond(): number {
    return this.getTimeComponents().ms;
  }

  getTime(): number {
    return this._timestamp;
  }

  toDate(): Date {
    return new Date(this._timestamp);
  }

  // ---------------------------------------------------------------------------
  // Setters — Jalali
  // ---------------------------------------------------------------------------

  setShYear(y: number): this {
    const cur = this.getShComponents();
    const maxDay = jalaliMonthLength(y, cur.month);
    const day = Math.min(cur.day, maxDay);
    const jdn = jalaliToJDN(y, cur.month, day);
    this.updateFromJDN(jdn);
    return this;
  }

  setShMonth(m: number): this {
    const cur = this.getShComponents();
    const maxDay = jalaliMonthLength(cur.year, m);
    const day = Math.min(cur.day, maxDay);
    const jdn = jalaliToJDN(cur.year, m, day);
    this.updateFromJDN(jdn);
    return this;
  }

  setShDay(d: number): this {
    const cur = this.getShComponents();
    const jdn = jalaliToJDN(cur.year, cur.month, d);
    this.updateFromJDN(jdn);
    return this;
  }

  // ---------------------------------------------------------------------------
  // Setters — Hijri
  // ---------------------------------------------------------------------------

  setHjYear(y: number): this {
    const cur = this.getHjComponents();
    const maxDay = hijriMonthLength(y, cur.month);
    const day = Math.min(cur.day, maxDay);
    const jdn = hijriToJDN(y, cur.month, day, this._hijriAdjustment);
    this.updateFromJDN(jdn);
    return this;
  }

  setHjMonth(m: number): this {
    const cur = this.getHjComponents();
    const maxDay = hijriMonthLength(cur.year, m);
    const day = Math.min(cur.day, maxDay);
    const jdn = hijriToJDN(cur.year, m, day, this._hijriAdjustment);
    this.updateFromJDN(jdn);
    return this;
  }

  setHjDay(d: number): this {
    const cur = this.getHjComponents();
    const jdn = hijriToJDN(cur.year, cur.month, d, this._hijriAdjustment);
    this.updateFromJDN(jdn);
    return this;
  }

  // ---------------------------------------------------------------------------
  // Setters — Gregorian
  // ---------------------------------------------------------------------------

  setGrgYear(y: number): this {
    const cur = this.getGrgComponents();
    const maxDay = gregorianMonthLength(y, cur.month);
    const day = Math.min(cur.day, maxDay);
    this.updateFromGrg(y, cur.month, day);
    return this;
  }

  setGrgMonth(m: number): this {
    const cur = this.getGrgComponents();
    const maxDay = gregorianMonthLength(cur.year, m);
    const day = Math.min(cur.day, maxDay);
    this.updateFromGrg(cur.year, m, day);
    return this;
  }

  setGrgDay(d: number): this {
    const cur = this.getGrgComponents();
    this.updateFromGrg(cur.year, cur.month, d);
    return this;
  }

  // ---------------------------------------------------------------------------
  // Setters — Time
  // ---------------------------------------------------------------------------

  setHour(h: number): this {
    const d = new Date(this._timestamp);
    d.setHours(h);
    this._timestamp = d.getTime();
    this.invalidateCache();
    return this;
  }

  setMinute(m: number): this {
    const d = new Date(this._timestamp);
    d.setMinutes(m);
    this._timestamp = d.getTime();
    this.invalidateCache();
    return this;
  }

  setSecond(s: number): this {
    const d = new Date(this._timestamp);
    d.setSeconds(s);
    this._timestamp = d.getTime();
    this.invalidateCache();
    return this;
  }

  setMillisecond(ms: number): this {
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
  toJalali(y?: number, m?: number, d?: number): number[] {
    if (y !== undefined && m !== undefined && d !== undefined) {
      const jdn = gregorianToJDN(y, m, d);
      const res = jdnToJalali(jdn);
      return [res.year, res.month, res.day];
    }
    const sh = this.getShComponents();
    return [sh.year, sh.month, sh.day];
  }

  static toJalali(y: number, m: number, d: number): number[] {
    const jdn = gregorianToJDN(y, m, d);
    const res = jdnToJalali(jdn);
    return [res.year, res.month, res.day];
  }

  /** قمری → شمسی */
  toJalaliFromHijri(y?: number, m?: number, d?: number): number[] {
    if (y !== undefined && m !== undefined && d !== undefined) {
      const jdn = hijriToJDN(y, m, d, this._hijriAdjustment);
      const res = jdnToJalali(jdn);
      return [res.year, res.month, res.day];
    }
    const sh = this.getShComponents();
    return [sh.year, sh.month, sh.day];
  }

  static toJalaliFromHijri(y: number, m: number, d: number, adjustment = 0): number[] {
    const jdn = hijriToJDN(y, m, d, adjustment);
    const res = jdnToJalali(jdn);
    return [res.year, res.month, res.day];
  }

  /** شمسی → میلادی */
  toGregorian(y?: number, m?: number, d?: number): number[] {
    if (y !== undefined && m !== undefined && d !== undefined) {
      const jdn = jalaliToJDN(y, m, d);
      const res = jdnToGregorian(jdn);
      return [res.year, res.month, res.day];
    }
    const grg = this.getGrgComponents();
    return [grg.year, grg.month, grg.day];
  }

  static toGregorian(y: number, m: number, d: number): number[] {
    const jdn = jalaliToJDN(y, m, d);
    const res = jdnToGregorian(jdn);
    return [res.year, res.month, res.day];
  }

  /** قمری → میلادی */
  toGregorianFromHijri(y?: number, m?: number, d?: number): number[] {
    if (y !== undefined && m !== undefined && d !== undefined) {
      const jdn = hijriToJDN(y, m, d, this._hijriAdjustment);
      const res = jdnToGregorian(jdn);
      return [res.year, res.month, res.day];
    }
    const grg = this.getGrgComponents();
    return [grg.year, grg.month, grg.day];
  }

  static toGregorianFromHijri(y: number, m: number, d: number, adjustment = 0): number[] {
    const jdn = hijriToJDN(y, m, d, adjustment);
    const res = jdnToGregorian(jdn);
    return [res.year, res.month, res.day];
  }

  /** شمسی → قمری */
  toHijri(y?: number, m?: number, d?: number): number[] {
    if (y !== undefined && m !== undefined && d !== undefined) {
      const jdn = jalaliToJDN(y, m, d);
      const res = jdnToHijri(jdn, this._hijriAdjustment);
      return [res.year, res.month, res.day];
    }
    const hj = this.getHjComponents();
    return [hj.year, hj.month, hj.day];
  }

  static toHijri(y: number, m: number, d: number, adjustment = 0): number[] {
    const jdn = jalaliToJDN(y, m, d);
    const res = jdnToHijri(jdn, adjustment);
    return [res.year, res.month, res.day];
  }

  /** میلادی → قمری */
  toHijriFromGregorian(y?: number, m?: number, d?: number): number[] {
    if (y !== undefined && m !== undefined && d !== undefined) {
      const jdn = gregorianToJDN(y, m, d);
      const res = jdnToHijri(jdn, this._hijriAdjustment);
      return [res.year, res.month, res.day];
    }
    const hj = this.getHjComponents();
    return [hj.year, hj.month, hj.day];
  }

  static toHijriFromGregorian(y: number, m: number, d: number, adjustment = 0): number[] {
    const jdn = gregorianToJDN(y, m, d);
    const res = jdnToHijri(jdn, adjustment);
    return [res.year, res.month, res.day];
  }

  /** General converter between calendars */
  convert(from: CalendarType, to: CalendarType, y?: number, m?: number, d?: number): number[] {
    if (y !== undefined && m !== undefined && d !== undefined) {
      let jdn: number;
      if (from === 'gregorian') jdn = gregorianToJDN(y, m, d);
      else if (from === 'jalali') jdn = jalaliToJDN(y, m, d);
      else jdn = hijriToJDN(y, m, d, this._hijriAdjustment);

      if (to === 'gregorian') {
        const r = jdnToGregorian(jdn);
        return [r.year, r.month, r.day];
      }
      if (to === 'jalali') {
        const r = jdnToJalali(jdn);
        return [r.year, r.month, r.day];
      }
      const r = jdnToHijri(jdn, this._hijriAdjustment);
      return [r.year, r.month, r.day];
    }

    if (to === 'gregorian') return this.toGregorian();
    if (to === 'jalali') return this.toJalali();
    return this.toHijri();
  }

  static convert(
    from: CalendarType,
    to: CalendarType,
    y: number,
    m: number,
    d: number,
    adjustment = 0
  ): number[] {
    let jdn: number;
    if (from === 'gregorian') jdn = gregorianToJDN(y, m, d);
    else if (from === 'jalali') jdn = jalaliToJDN(y, m, d);
    else jdn = hijriToJDN(y, m, d, adjustment);

    if (to === 'gregorian') {
      const r = jdnToGregorian(jdn);
      return [r.year, r.month, r.day];
    }
    if (to === 'jalali') {
      const r = jdnToJalali(jdn);
      return [r.year, r.month, r.day];
    }
    const r = jdnToHijri(jdn, adjustment);
    return [r.year, r.month, r.day];
  }

  // ---------------------------------------------------------------------------
  // Calendar Calculations
  // ---------------------------------------------------------------------------

  isLeap(calendar: CalendarType = 'jalali'): boolean {
    if (calendar === 'jalali') return isJalaliLeap(this.getShYear());
    if (calendar === 'gregorian') return isGregorianLeap(this.getGrgYear());
    return isHijriLeap(this.getHjYear());
  }

  grgIsLeap(): boolean {
    return isGregorianLeap(this.getGrgYear());
  }

  hjIsLeap(): boolean {
    return isHijriLeap(this.getHjYear());
  }

  /**
   * Day of week: 0-6.
   * For Jalali: 0=Saturday (شنبه), 1=Sunday, ..., 6=Friday.
   * For Gregorian: 0=Sunday, 1=Monday, ..., 6=Saturday.
   * For Hijri: 0=Saturday (السبت) or Sunday. Defaults to 0=Saturday in Arabic week.
   */
  dayOfWeek(calendar: CalendarType = 'jalali'): number {
    if (calendar === 'jalali') {
      return jalaliDayOfWeek(this.getShYear(), this.getShMonth(), this.getShDay());
    }
    if (calendar === 'gregorian') {
      return gregorianDayOfWeek(this.getGrgYear(), this.getGrgMonth(), this.getGrgDay());
    }
    return hijriDayOfWeek(this.getHjYear(), this.getHjMonth(), this.getHjDay(), this._hijriAdjustment);
  }

  getDayInYear(calendar: CalendarType = 'jalali'): number {
    if (calendar === 'jalali') {
      return jalaliDayOfYear(this.getShMonth(), this.getShDay());
    }
    if (calendar === 'gregorian') {
      return gregorianDayOfYear(this.getGrgYear(), this.getGrgMonth(), this.getGrgDay());
    }
    const jdn = this.getJDN();
    const hy = this.getHjYear();
    const startJdn = hijriToJDN(hy, 1, 1, this._hijriAdjustment);
    return jdn - startJdn + 1;
  }

  getMonthDays(calendar: CalendarType = 'jalali'): number {
    if (calendar === 'jalali') return jalaliMonthLength(this.getShYear(), this.getShMonth());
    if (calendar === 'gregorian') return gregorianMonthLength(this.getGrgYear(), this.getGrgMonth());
    return hijriMonthLength(this.getHjYear(), this.getHjMonth());
  }

  getMonthLength(calendar: CalendarType = 'jalali'): number {
    return this.getMonthDays(calendar);
  }

  getDaysInMonth(calendar: CalendarType, y: number, m: number): number {
    if (calendar === 'jalali') return jalaliMonthLength(y, m);
    if (calendar === 'gregorian') return gregorianMonthLength(y, m);
    return hijriMonthLength(y, m);
  }

  dayName(calendar: CalendarType = 'jalali'): string {
    const dow = this.dayOfWeek(calendar);
    if (calendar === 'jalali') {
      const names = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
      return names[dow] || '';
    }
    if (calendar === 'hijri') {
      const names = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
      return names[dow] || '';
    }
    const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return names[dow] || '';
  }

  monthName(calendar: CalendarType = 'jalali'): string {
    if (calendar === 'jalali') {
      const names = [
        '',
        'فروردین', 'اردیبهشت', 'خرداد',
        'تیر', 'مرداد', 'شهریور',
        'مهر', 'آبان', 'آذر',
        'دی', 'بهمن', 'اسفند',
      ];
      return names[this.getShMonth()] || '';
    }
    if (calendar === 'hijri') {
      const names = [
        '',
        'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر',
        'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
        'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة',
      ];
      return names[this.getHjMonth()] || '';
    }
    const names = [
      '',
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return names[this.getGrgMonth()] || '';
  }

  // ---------------------------------------------------------------------------
  // Manipulation & Arithmetic
  // ---------------------------------------------------------------------------

  clone(): SmartDate {
    return new SmartDate(this._timestamp, this._hijriAdjustment, this._hijriPreset);
  }

  addDays(n: number): SmartDate {
    const copy = this.clone();
    const curJdn = copy.getJDN();
    copy.updateFromJDN(curJdn + n);
    return copy;
  }

  subDays(n: number): SmartDate {
    return this.addDays(-n);
  }

  addMonths(n: number, calendar: CalendarType = 'jalali'): SmartDate {
    const copy = this.clone();
    if (calendar === 'jalali') {
      let y = copy.getShYear();
      let m = copy.getShMonth() + n;
      const d = copy.getShDay();

      while (m > 12) { m -= 12; y++; }
      while (m < 1) { m += 12; y--; }

      const maxDays = jalaliMonthLength(y, m);
      const clampedDay = Math.min(d, maxDays);
      const jdn = jalaliToJDN(y, m, clampedDay);
      copy.updateFromJDN(jdn);
      return copy;
    }

    if (calendar === 'hijri') {
      let y = copy.getHjYear();
      let m = copy.getHjMonth() + n;
      const d = copy.getHjDay();

      while (m > 12) { m -= 12; y++; }
      while (m < 1) { m += 12; y--; }

      const maxDays = hijriMonthLength(y, m);
      const clampedDay = Math.min(d, maxDays);
      const jdn = hijriToJDN(y, m, clampedDay, copy._hijriAdjustment);
      copy.updateFromJDN(jdn);
      return copy;
    }

    // Gregorian
    let y = copy.getGrgYear();
    let m = copy.getGrgMonth() + n;
    const d = copy.getGrgDay();

    while (m > 12) { m -= 12; y++; }
    while (m < 1) { m += 12; y--; }

    const maxDays = gregorianMonthLength(y, m);
    const clampedDay = Math.min(d, maxDays);
    copy.updateFromGrg(y, m, clampedDay);
    return copy;
  }

  subMonths(n: number, calendar: CalendarType = 'jalali'): SmartDate {
    return this.addMonths(-n, calendar);
  }

  addYears(n: number, calendar: CalendarType = 'jalali'): SmartDate {
    const copy = this.clone();
    if (calendar === 'jalali') {
      const y = copy.getShYear() + n;
      const m = copy.getShMonth();
      const d = copy.getShDay();
      const maxDays = jalaliMonthLength(y, m);
      const clampedDay = Math.min(d, maxDays);
      const jdn = jalaliToJDN(y, m, clampedDay);
      copy.updateFromJDN(jdn);
      return copy;
    }
    if (calendar === 'hijri') {
      const y = copy.getHjYear() + n;
      const m = copy.getHjMonth();
      const d = copy.getHjDay();
      const maxDays = hijriMonthLength(y, m);
      const clampedDay = Math.min(d, maxDays);
      const jdn = hijriToJDN(y, m, clampedDay, copy._hijriAdjustment);
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

  subYears(n: number, calendar: CalendarType = 'jalali'): SmartDate {
    return this.addYears(-n, calendar);
  }

  addDate(years: number, months: number, days: number): SmartDate {
    return this.addYears(years).addMonths(months).addDays(days);
  }

  startOfDay(): SmartDate {
    const copy = this.clone();
    copy.setHour(0).setMinute(0).setSecond(0).setMillisecond(0);
    return copy;
  }

  startOfMonth(calendar: CalendarType = 'jalali'): SmartDate {
    const copy = this.clone().startOfDay();
    if (calendar === 'jalali') return copy.setShDay(1);
    if (calendar === 'hijri') return copy.setHjDay(1);
    return copy.setGrgDay(1);
  }

  startOfYear(calendar: CalendarType = 'jalali'): SmartDate {
    const copy = this.clone().startOfDay();
    if (calendar === 'jalali') return copy.setShMonth(1).setShDay(1);
    if (calendar === 'hijri') return copy.setHjMonth(1).setHjDay(1);
    return copy.setGrgMonth(1).setGrgDay(1);
  }

  endOfMonth(calendar: CalendarType = 'jalali'): SmartDate {
    const copy = this.clone();
    copy.setHour(23).setMinute(59).setSecond(59).setMillisecond(999);
    const maxDay = copy.getMonthDays(calendar);
    if (calendar === 'jalali') return copy.setShDay(maxDay);
    if (calendar === 'hijri') return copy.setHjDay(maxDay);
    return copy.setGrgDay(maxDay);
  }

  endOfYear(calendar: CalendarType = 'jalali'): SmartDate {
    const copy = this.clone();
    copy.setHour(23).setMinute(59).setSecond(59).setMillisecond(999);
    if (calendar === 'jalali') {
      const maxDay = jalaliMonthLength(copy.getShYear(), 12);
      return copy.setShMonth(12).setShDay(maxDay);
    }
    if (calendar === 'hijri') {
      const maxDay = hijriMonthLength(copy.getHjYear(), 12);
      return copy.setHjMonth(12).setHjDay(maxDay);
    }
    const maxDay = gregorianMonthLength(copy.getGrgYear(), 12);
    return copy.setGrgMonth(12).setGrgDay(maxDay);
  }

  // ---------------------------------------------------------------------------
  // Comparison
  // ---------------------------------------------------------------------------

  after(other: SmartDate): boolean {
    return this.getTime() > other.getTime();
  }

  before(other: SmartDate): boolean {
    return this.getTime() < other.getTime();
  }

  equals(other: SmartDate): boolean {
    return this.getTime() === other.getTime();
  }

  compare(other: SmartDate): number {
    const t1 = this.getTime();
    const t2 = other.getTime();
    if (t1 < t2) return -1;
    if (t1 > t2) return 1;
    return 0;
  }

  diff(other: SmartDate, calendar: CalendarType = 'jalali'): { years: number; months: number; days: number } {
    let d1 = this.clone();
    let d2 = other.clone();
    const isNegative = d1.before(d2);
    if (isNegative) {
      const temp = d1;
      d1 = d2;
      d2 = temp;
    }

    let y1: number, m1: number, day1: number;
    let y2: number, m2: number, day2: number;

    if (calendar === 'jalali') {
      y1 = d1.getShYear(); m1 = d1.getShMonth(); day1 = d1.getShDay();
      y2 = d2.getShYear(); m2 = d2.getShMonth(); day2 = d2.getShDay();
    } else if (calendar === 'hijri') {
      y1 = d1.getHjYear(); m1 = d1.getHjMonth(); day1 = d1.getHjDay();
      y2 = d2.getHjYear(); m2 = d2.getHjMonth(); day2 = d2.getHjDay();
    } else {
      y1 = d1.getGrgYear(); m1 = d1.getGrgMonth(); day1 = d1.getGrgDay();
      y2 = d2.getGrgYear(); m2 = d2.getGrgMonth(); day2 = d2.getGrgDay();
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
      days: isNegative ? -days : days,
    };
  }

  untilToday(calendar: CalendarType = 'jalali'): { years: number; months: number; days: number } {
    const today = SmartDate.now(this._hijriAdjustment, this._hijriPreset);
    return this.diff(today, calendar);
  }

  getDayUntilToday(calendar: CalendarType = 'jalali'): number {
    const today = SmartDate.now(this._hijriAdjustment, this._hijriPreset).startOfDay();
    const current = this.startOfDay();
    return Math.round((today.getTime() - current.getTime()) / (24 * 60 * 60 * 1000));
  }

  // ---------------------------------------------------------------------------
  // Format
  // ---------------------------------------------------------------------------

  format(pattern: string, calendar?: CalendarType): string {
    return new SmartDateFormat(pattern).format(this, calendar);
  }
}
