# 📅 Persian Datepicker v3 & SmartDate Engine
### Modern, Zero-Dependency, Multi-Calendar Datepicker (Jalali, Gregorian, Hijri)

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live%20Demo-haedarfarhani.github.io-success?style=for-the-badge&logo=github)](https://haedarfarhani.github.io/date-picker-javascript/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Three Calendars](https://img.shields.io/badge/Calendars-Jalali%20%7C%20Gregorian%20%7C%20Hijri-purple?style=for-the-badge)](#)

</div>

---

### 🌐 Live Demo & Playground / پیش‌نمایش زنده / العرض التوضيحي المباشر
🔗 **Online Demo:** [https://haedarfarhani.github.io/date-picker-javascript/](https://haedarfarhani.github.io/date-picker-javascript/)

---

## 📑 فهرست راهنما / Table of Contents / جدول المحتويات
1. [🇮🇷 مستندات و راهنمای پیاده‌سازی به زبان فارسی](#-مستندات-فارسی-persian)
2. [🇬🇧 English Implementation & API Guide](#-english-documentation)
3. [🇸🇦 التوثيق ودليل التنفيذ باللغة العربية](#-التوثيق-باللغة-العربية-arabic)

---

<div dir="rtl">

## 🇮🇷 مستندات فارسی (Persian)

کتابخانه **Persian Datepicker v3** یک راهکار مدرن، سبک و کاملاً مستقل (Zero-Dependency) برای انتخاب تاریخ، محدوده تاریخ (Range) و زمان با پشتیبانی هم‌زمان از تقویم‌های **شمسی (جلالی)**، **میلادی (Gregorian)** و **قمری (هجری)** است.

### 🌟 ویژگی‌های برجسته
- 🚀 **پیش‌نمایش آنلاین:** [https://haedarfarhani.github.io/date-picker-javascript/](https://haedarfarhani.github.io/date-picker-javascript/)
- 📆 **سه تقویم همزمان:** تبدیل و نمایش بی‌نقص بین تقویم شمسی، میلادی و هجری قمری بدون افت دقت در سال‌های کبیسه.
- 🔄 **سوییچر تقویم پویا (`calendarSwitcher`):** تعویض تقویم در حین باز بودن پنجره بدون بسته شدن ناگهانی یا از دست رفتن تاریخ انتخابی.
- 📐 **موتور قدرتمند `SmartDate`:** قالب‌بندی و تبدیل تاریخ بر اساس الگوهای استاندارد فرمت‌دهی (`Y/m/d`, `l j F Y`, `H:i:s`).
- 🎨 **۵ تم مدرن و ۵ طرح ساختاری:** تم‌های `light`، `dark`، `material`، `ios` و `glass` به همراه ساختارهای `default`، `rounded`، `minimal`، `bordered` و `compact`.
- 📱 **پاسخ‌گوی موبایل (Mobile-First):** در صفحات موبایل به‌صورت خودکار به Bottom Sheet لمسی با اندازه سلول ۴۴px تبدیل می‌شود.
- ♿ **دسترس‌پذیری کامل (WAI-ARIA):** پشتیبانی از کلیدهای جهت‌نما، مدیریت فوکوس، و سازگاری با صفحه‌خوان‌ها.
- 🔌 **پشتیبانی از فریم‌ورک‌ها:** دارای کامپوننت و رپرهای رسمی برای React، Vue 3، Angular و Svelte.

---

### ۱. نصب و راه‌اندازی

```bash
# با استفاده از npm
npm install my-datepicker-core

# با استفاده از pnpm
pnpm add my-datepicker-core

# با استفاده از yarn
yarn add my-datepicker-core
```

#### ایمپورت استایل‌ها (CSS):
```css
/* در فایل استایل اصلی پروژه */
@import 'my-datepicker-core/styles.css';
```

---

### ۲. شروع سریع (Vanilla JavaScript)

```html
<div id="calendar-container"></div>

<script type="module">
  import { DatePicker } from 'my-datepicker-core';

  const picker = new DatePicker('#calendar-container', {
    calendar: 'jalali',       // تقویم: 'jalali' | 'gregorian' | 'hijri'
    mode: 'single',           // حالت: 'single' | 'range' | 'multiple'
    value: '1403/07/15',      // مقدار اولیه
    pattern: 'Y/m/d',         // الگوی فرمت تاریخ
    calendarSwitcher: true,   // فعال بودن دکمه تعویض تقویم در هدر
    theme: 'light',           // تم
    design: 'rounded'         // سبک گوشه‌ها و خطوط
  });

  // شنود رویداد تغییر تاریخ
  picker.on('change', ({ value, smartDate }) => {
    console.log('تاریخ انتخاب شده:', value);
  });
</script>
```

---

### ۳. جدول کامل تنظیمات (`DatePickerOptions`)

| پارامتر | نوع داده (Type) | پیش‌فرض | توضیحات |
| :--- | :--- | :--- | :--- |
| `calendar` | `'jalali' \| 'gregorian' \| 'hijri'` | `'gregorian'` | نوع تقویم پایه برای نمایش |
| `mode` | `'single' \| 'range' \| 'multiple'` | `'single'` | حالت انتخاب: تک‌تاریخ، بازه زمانی، یا چند تاریخ مجزا |
| `value` | `string \| string[] \| Date \| Date[]` | `null` | مقدار اولیه انتخابی |
| `pattern` | `string` | خودکار | الگوی فرمت رشته تاریخ خروجی (مانند `'Y/m/d'` یا `'l j F Y'`) |
| `calendarSwitcher`| `boolean` | `false` | نمایش کلیدهای جابجایی بین تقویم‌ها در بالای پنل |
| `theme` | `'light' \| 'dark' \| 'material' \| 'ios' \| 'glass'` | `'light'` | تم گرافیکی تقویم |
| `design` | `'default' \| 'rounded' \| 'minimal' \| 'bordered' \| 'compact'` | `'default'` | سبک ظاهری و میزان گردی سلول‌ها |
| `layout` | `'popup' \| 'inline' \| 'multi-month'` | `'popup'` | نمایش به صورت پاپ‌آپ، جاسازی ثابت درون صفحه یا چندماهه |
| `monthsCount` | `number` | `2` | تعداد ماه‌های نمایشی در حالت `multi-month` |
| `showTime` | `boolean` | `false` | نمایش کنترل انتخاب ساعت و دقیقه |
| `timeFormat` | `'12h' \| '24h'` | `'24h'` | فرمت نمایش ساعت (۲۴ ساعته یا ۱۲ ساعته با ب.ظ/ق.ظ) |
| `minDate` | `string \| Date \| SmartDate` | `null` | حداقل تاریخ مجاز برای انتخاب |
| `maxDate` | `string \| Date \| SmartDate` | `null` | حداکثر تاریخ مجاز برای انتخاب |
| `disabledDates` | `string[] \| ((d: SmartDate) => boolean)` | `[]` | لیست یا تابع بررسی روزهای غیرفعال و تعطیل |
| `disabledWeekdays`| `number[]` | `[]` | روزهای غیرفعال هفته (۰ = یکشنبه، ۶ = شنبه) |
| `firstDayOfWeek` | `0 \| 1 \| 6` | بر اساس تقویم | روز آغاز هفته (برای شمسی و قمری شنبه `6`، میلادی یکشنبه `0` یا دوشنبه `1`) |
| `numeralSystem` | `'latn' \| 'arabext' \| 'arab'` | خودکار | نمایش ارقام: لاتین (123)، فارسی (۱۲۳)، عربی (١٢٣) |
| `hijriAdjustment`| `number` | `0` | تعدیل روزهای ماه قمری بر اساس رؤیت هلال (-2 تا +2) |
| `hijriPreset` | `'tabular' \| 'umm-alqura' \| 'iranian'`| `'tabular'` | الگوریتم محاسباتی تقویم هجری قمری |
| `locale` | `string \| Partial<LocaleConfig>` | `'fa'` / `'en'` | کد زبان یا تنظیمات کامل نام ماه‌ها و روزها |
| `placeholder` | `string` | `'انتخاب تاریخ'` | متن نگهدارنده در فیلد ورودی |
| `inline` | `boolean` | `false` | آیا به صورت مستقیم درون صفحه رندر شود یا به صورت پاپ‌آپ |
| `zIndex` | `number` | `1000` | لایه نمایش پنجره پاپ‌آپ |

---

### ۴. مرجع متدهای کلاس `DatePicker`

تمام متدها به‌صورت امن و تعاملی پیاده‌سازی شده‌اند:

```javascript
// باز کردن دستی پنجره تقویم
picker.open();

// بستن پنجره
picker.close();

// تغییر وضعیت (Toggle)
picker.toggle();

// دریافت مقدار فرمت‌شده جاری (مثلاً "1403/07/15")
const strValue = picker.getValue();

// دریافت آبجکت تاریخ یکپارچه SmartDate
const smart = picker.getSmartDate();
console.log(smart.toJalali().year, smart.toGregorian().year);

// تنظیم یا تغییر تاریخ انتخابی از طریق کد
picker.setValue('1403/08/20');

// پاک‌سازی تاریخ انتخاب‌شده
picker.clear();

// تغییر سیستم تقویم به صورت لحظه‌ای بدون بسته شدن پاپ‌آپ
picker.switchCalendar('gregorian'); // یا 'jalali' یا 'hijri'

// تغییر زبان محیط کاربری
picker.setLocale('fa'); // یا 'en' یا 'ar'

// قالب‌بندی هر تاریخ دلخواه با الگوهای مختلف
const formatted = picker.formatDate(new Date(), 'l j F Y');

// پارس کردن رشته متنی به آبجکت SmartDate
const parsed = picker.parseDate('1403/07/15', 'Y/m/d', 'jalali');

// بروزرسانی تنظیمات و رندر مجدد بدون تخریب نمونه
picker.update({ theme: 'dark', design: 'minimal' });

// از بین بردن نمونه و پاک‌سازی شنودنده‌ها از حافظه
picker.destroy();
```

---

### ۵. جدول رویدادها (`Events`)

با استفاده از متد `.on(eventName, callback)` می‌توانید به رویدادها گوش دهید:

| رویداد | آرگومان ارسالی (Payload) | زمان تحریک |
| :--- | :--- | :--- |
| `open` | `{}` | هنگام باز شدن پنجره تقویم |
| `close` | `{}` | هنگام بسته شدن پنجره تقویم |
| `select` | `{ date, smartDate, value }` | با کلیک و انتخاب یک روز توسط کاربر |
| `change` | `{ value, smartDate }` | هر زمان که مقدار نهایی تقویم تغییر کند |
| `calendar-change` | `{ calendar }` | هنگام سوییچ بین تقویم‌های شمسی، میلادی یا قمری |
| `navigate` | `{ year, month, calendar }` | با رفتن به ماه یا سال قبل و بعد |
| `clear` | `{}` | هنگام کلیک روی دکمه پاک‌کردن تاریخ |
| `error` | `{ message }` | در صورت بروز خطای اعتبارسنجی تاریخ یا ورودی نامعتبر |

---

### ۶. توکن‌های استاندارد فرمت‌دهی موتور `SmartDate`

| توکن | توضیح | مثال در تقویم شمسی |
| :---: | :--- | :--- |
| `Y` | سال چهار رقمی | `1403` |
| `y` | سال دو رقمی | `03` |
| `m` | ماه دو رقمی با صفر اول (01-12) | `07` |
| `n` | شماره ماه بدون صفر (1-12) | `7` |
| `F` | نام کامل ماه | `مهر` |
| `M` | نام کوتاه شده ماه | `مهر` |
| `d` | روز ماه با صفر اول (01-31) | `05` |
| `j` | روز ماه بدون صفر (1-31) | `5` |
| `l` | نام کامل روز هفته | `شنبه` |
| `D` | نام مخفف روز هفته | `ش` |
| `H` | ساعت ۲۴ ساعته با صفر (00-23) | `14` |
| `h` | ساعت ۱۲ ساعته با صفر (01-12) | `02` |
| `i` | دقیقه با صفر اول (00-59) | `30` |
| `s` | ثانیه با صفر اول (00-59) | `45` |
| `a` | شناسه روز کوتاه (ق.ظ / ب.ظ) | `ب.ظ` |
| `A` | شناسه روز بزرگ | `ب.ظ` / `PM` |

---

### ۷. نمونه‌کدهای پیاده‌سازی در فریم‌ورک‌ها

#### ۱) در جاوا اسکریپت خالص (Vanilla JavaScript):
```html
<link rel="stylesheet" href="node_modules/my-datepicker-core/styles.css" />
<div id="calendar"></div>

<script type="module">
  import { DatePicker } from 'my-datepicker-core';

  const dp = new DatePicker('#calendar', {
    calendar: 'jalali',
    calendarSwitcher: true,
    mode: 'single',
    value: new Date(),
    pattern: 'l j F Y',
    theme: 'light',
    design: 'rounded'
  });

  dp.on('change', ({ value }) => console.log('تاریخ انتخاب شده:', value));
</script>
```

#### ۲) در React (هوک‌ها و TypeScript):
```tsx
import React, { useState } from 'react';
import { DatePicker } from 'my-datepicker-react';
import 'my-datepicker-core/styles.css';

export function MyComponent() {
  const [date, setDate] = useState('1405/07/16');

  return (
    <DatePicker
      calendar="jalali"
      calendarSwitcher={true}
      mode="single"
      pattern="l j F Y"
      theme="glass"
      design="rounded"
      value={date}
      onChange={(newVal) => setDate(newVal)}
      onCalendarChange={(cal) => console.log('تقویم فعال:', cal)}
    />
  );
}
```

#### ۳) در Vue 3 (با ترکیب Composition API و v-model):
```vue
<template>
  <DatePicker
    v-model="selectedDate"
    calendar="jalali"
    :calendar-switcher="true"
    theme="ios"
    design="rounded"
    pattern="l j F Y"
  />
</template>

<script setup>
import { ref } from 'vue';
import { DatePicker } from 'my-datepicker-vue';
import 'my-datepicker-core/styles.css';

const selectedDate = ref('1405/07/16');
</script>
```

#### ۴) در Angular (سازگار با Forms و ngModel):
```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MyDatepickerAngular } from 'my-datepicker-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, MyDatepickerAngular],
  template: `
    <my-datepicker-angular
      [(ngModel)]="currentDate"
      calendar="jalali"
      [calendarSwitcher]="true"
      theme="material"
      design="rounded">
    </my-datepicker-angular>
  `
})
export class AppComponent {
  currentDate = '1405/07/16';
}
```

---

### ۸. کلیدهای دسترسی کیبورد (Accessibility)
- `ArrowRight` / `ArrowLeft`: جابجایی بین روزها (در حالت راست‌به‌چپ به‌صورت طبیعی معکوس می‌شود).
- `ArrowUp` / `ArrowDown`: رفتن به هفته قبل یا بعد.
- `PageUp` / `PageDown`: جابجایی بین ماه‌ها.
- `Shift + PageUp` / `Shift + PageDown`: جابجایی بین سال‌ها.
- `Home` / `End`: رفتن به اولین یا آخرین روز ماه جاری.
- `Enter` / `Space`: انتخاب روز در حالت فوکوس.
- `Escape`: بستن پنجره تقویم و بازگرداندن فوکوس به فیلد ورودی.

</div>

---

## 🇬🇧 English Documentation

**Persian Datepicker v3** is a production-grade, zero-dependency multi-calendar datepicker library providing native support for **Jalali (Persian)**, **Gregorian**, and **Hijri (Islamic)** calendars, rich micro-interactions, responsive bottom sheets for mobile, and complete WAI-ARIA accessibility.

### 🌟 Key Highlights
- 🚀 **Interactive Live Demo:** [https://haedarfarhani.github.io/date-picker-javascript/](https://haedarfarhani.github.io/date-picker-javascript/)
- 📆 **Tri-Calendar Engine:** Seamless transitions between Jalali, Gregorian, and Hijri systems with accurate leap-year calculations.
- 🔄 **Dynamic Calendar Switcher (`calendarSwitcher: true`):** Switch between calendar systems on-the-fly without the picker closing or losing selection state.
- 📐 **Unified SmartDate Engine:** High-performance date math and pattern formatting (`Y/m/d`, `l j F Y`, `H:i`).
- 🎨 **5 UI Themes & 5 Design Variants:** `light`, `dark`, `material`, `ios`, and `glass` themes; `default`, `rounded`, `minimal`, `bordered`, and `compact` designs.
- 📱 **Mobile Bottom Sheet:** Automatically transitions to a fluid bottom sheet with 44px touch targets on mobile viewports.
- ♿ **WAI-ARIA Compliant:** Focus management, keyboard navigation, and live screen reader region announcements.
- 📦 **First-Class Framework Wrappers:** Ready-to-use packages for React, Vue 3, Angular, Svelte, and Vanilla JS.

---

### 1. Installation

```bash
# npm
npm install my-datepicker-core

# pnpm
pnpm add my-datepicker-core

# yarn
yarn add my-datepicker-core
```

#### Import Stylesheet:
```css
import 'my-datepicker-core/styles.css';
```

---

### 2. Quick Start (Vanilla JS)

```html
<div id="datepicker"></div>

<script type="module">
  import { DatePicker } from 'my-datepicker-core';

  const dp = new DatePicker('#datepicker', {
    calendar: 'jalali',
    mode: 'single',
    value: '1403/07/15',
    pattern: 'Y/m/d',
    calendarSwitcher: true,
    theme: 'light',
    design: 'rounded'
  });

  dp.on('change', ({ value, smartDate }) => {
    console.log('Selected date:', value);
  });
</script>
```

---

### 3. Complete Configuration Options (`DatePickerOptions`)

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `calendar` | `'jalali' \| 'gregorian' \| 'hijri'` | `'gregorian'` | Base calendar system to display |
| `mode` | `'single' \| 'range' \| 'multiple'` | `'single'` | Date selection mode |
| `value` | `string \| string[] \| Date \| Date[]` | `null` | Initial date value(s) |
| `pattern` | `string` | Auto | Date format pattern (Standard token syntax) |
| `calendarSwitcher`| `boolean` | `false` | Enable interactive calendar switcher buttons |
| `theme` | `'light' \| 'dark' \| 'material' \| 'ios' \| 'glass'` | `'light'` | Color scheme and visual styling theme |
| `design` | `'default' \| 'rounded' \| 'minimal' \| 'bordered' \| 'compact'` | `'default'` | Shape and container layout variant |
| `layout` | `'popup' \| 'inline' \| 'multi-month'` | `'popup'` | Display mode (dropdown popup, embedded inline, or side-by-side months) |
| `monthsCount` | `number` | `2` | Number of months displayed in `multi-month` mode |
| `showTime` | `boolean` | `false` | Enable integrated hours/minutes time picker |
| `timeFormat` | `'12h' \| '24h'` | `'24h'` | Time display format |
| `minDate` | `string \| Date \| SmartDate` | `null` | Minimum selectable boundary |
| `maxDate` | `string \| Date \| SmartDate` | `null` | Maximum selectable boundary |
| `disabledDates` | `string[] \| ((d: SmartDate) => boolean)` | `[]` | Array or validator function for disabled dates |
| `disabledWeekdays`| `number[]` | `[]` | Days of the week to disable (0 = Sunday, 6 = Saturday) |
| `firstDayOfWeek` | `0 \| 1 \| 6` | Auto | Week start day (Jalali/Hijri default 6; Gregorian default 0 or 1) |
| `numeralSystem` | `'latn' \| 'arabext' \| 'arab'` | Auto | Numeral set: Latin (123), Persian (۱۲۳), or Arabic (١٢٣) |
| `hijriAdjustment`| `number` | `0` | Moon observation offset adjustment (-2 to +2 days) |
| `hijriPreset` | `'tabular' \| 'umm-alqura' \| 'iranian'`| `'tabular'` | Calculation algorithm preset for Hijri calendar |
| `locale` | `string \| Partial<LocaleConfig>` | Auto | Active locale or custom labels dictionary |
| `placeholder` | `string` | `'Select date'` | Input element placeholder |
| `inline` | `boolean` | `false` | Force permanent inline mounting |
| `zIndex` | `number` | `1000` | Floating popup z-index stacking layer |

---

### 4. Instance Methods Reference

```typescript
// Open popup
dp.open();

// Close popup
dp.close();

// Toggle popup visibility
dp.toggle();

// Get formatted value string (e.g. "1403/07/15" or ["...", "..."])
const val = dp.getValue();

// Get SmartDate instance for programmatic calculations
const smart = dp.getSmartDate();

// Set date value
dp.setValue('2025/10/06');

// Clear selection
dp.clear();

// Seamlessly switch active calendar system without closing the popup
dp.switchCalendar('jalali'); // 'jalali' | 'gregorian' | 'hijri'

// Switch active UI language/locale
dp.setLocale('fa');

// Format any date instance using custom tokens
const label = dp.formatDate(new Date(), 'l j F Y');

// Parse a string to SmartDate
const parsed = dp.parseDate('1403/07/15', 'Y/m/d', 'jalali');

// Dynamically update options and trigger re-render
dp.update({ theme: 'dark', design: 'bordered' });

// Destroy instance and remove DOM nodes
dp.destroy();
```

---

### 5. Events & Listeners

```typescript
// Subscribe to any datepicker event; returns an unsubscribe callback
const unsubscribe = dp.on('change', ({ value, smartDate }) => {
  console.log('Value changed to:', value);
});

// To unsubscribe:
// unsubscribe();
```

| Event | Payload | Description |
| :--- | :--- | :--- |
| `open` | `{}` | Triggered when popup opens |
| `close` | `{}` | Triggered when popup closes |
| `select` | `{ date, smartDate, value }` | Triggered when a day cell is clicked |
| `change` | `{ value, smartDate }` | Triggered whenever value changes |
| `calendar-change` | `{ calendar }` | Triggered when calendar system switches |
| `navigate` | `{ year, month, calendar }` | Triggered when navigating months or years |
| `clear` | `{}` | Triggered when value is cleared |
| `error` | `{ message }` | Triggered when an invalid date or range is provided |

---

### 6. Standard Formatting Tokens

| Token | Description | Example (Gregorian) | Example (Jalali) |
| :---: | :--- | :--- | :--- |
| `Y` | 4-digit year | `2025` | `1403` |
| `y` | 2-digit year | `25` | `03` |
| `m` | Month with leading zero (01-12) | `10` | `07` |
| `n` | Month without leading zero (1-12) | `10` | `7` |
| `F` | Full month name | `October` | `مهر` |
| `M` | Short month name | `Oct` | `مهر` |
| `d` | Day with leading zero (01-31) | `06` | `15` |
| `j` | Day without leading zero (1-31) | `6` | `15` |
| `l` | Full weekday name | `Monday` | `دوشنبه` |
| `D` | Short weekday name | `Mon` | `د` |
| `H` | 24-hour format with leading zero | `15` | `15` |
| `h` | 12-hour format with leading zero | `03` | `03` |
| `i` | Minutes with leading zero | `45` | `45` |
| `s` | Seconds with leading zero | `09` | `09` |
| `a` | Lowercase am/pm indicator | `pm` | `ب.ظ` |
| `A` | Uppercase AM/PM indicator | `PM` | `ب.ظ` |

---

### 7. Framework Integrations

#### 1) Vanilla JavaScript
```html
<link rel="stylesheet" href="node_modules/my-datepicker-core/styles.css" />
<div id="datepicker"></div>

<script type="module">
  import { DatePicker } from 'my-datepicker-core';

  const dp = new DatePicker('#datepicker', {
    calendar: 'jalali',
    calendarSwitcher: true,
    mode: 'single',
    value: new Date(),
    pattern: 'l j F Y',
    theme: 'light',
    design: 'rounded'
  });

  dp.on('change', ({ value }) => console.log('Selected:', value));
</script>
```

#### 2) React (TypeScript & Hooks)
```tsx
import React, { useState } from 'react';
import { DatePicker } from 'my-datepicker-react';
import 'my-datepicker-core/styles.css';

export function DateSelector() {
  const [date, setDate] = useState('1405/07/16');

  return (
    <DatePicker
      calendar="jalali"
      calendarSwitcher={true}
      mode="single"
      theme="glass"
      design="rounded"
      pattern="l j F Y"
      value={date}
      onChange={(val) => setDate(val)}
      onCalendarChange={(cal) => console.log('Calendar switched:', cal)}
    />
  );
}
```

#### 3) Vue 3 (Composition API & v-model)
```vue
<template>
  <DatePicker
    v-model="date"
    calendar="jalali"
    :calendar-switcher="true"
    theme="ios"
    design="rounded"
    pattern="l j F Y"
  />
</template>

<script setup>
import { ref } from 'vue';
import { DatePicker } from 'my-datepicker-vue';
import 'my-datepicker-core/styles.css';

const date = ref('1405/07/16');
</script>
```

#### 4) Angular (Standalone Component & Reactive Forms)
```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MyDatepickerAngular } from 'my-datepicker-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, MyDatepickerAngular],
  template: `
    <my-datepicker-angular
      [(ngModel)]="date"
      calendar="jalali"
      [calendarSwitcher]="true"
      theme="material"
      design="rounded">
    </my-datepicker-angular>
  `
})
export class AppComponent {
  date = '1405/07/16';
}
```

---

### 8. Keyboard Navigation (WAI-ARIA)
- `ArrowRight` / `ArrowLeft`: Move forward/backward one day.
- `ArrowUp` / `ArrowDown`: Move forward/backward one week.
- `PageUp` / `PageDown`: Previous/Next month.
- `Shift + PageUp` / `Shift + PageDown`: Previous/Next year.
- `Home` / `End`: First/Last day of current month.
- `Enter` / `Space`: Select the currently focused day.
- `Escape`: Close popup and return focus to trigger input.

---

<div dir="rtl">

## 🇸🇦 التوثيق باللغة العربية (Arabic)

مكتبة **Persian Datepicker v3** هي مكتبة جافاسكريبت متكاملة ومستقلة بدون أي مكتبات خارجية (Zero-Dependency)، مصممة لتقديم تجربة مستخدم عصرية وسلسة لاختيار التواريخ والأوقات مع دعم أصيل للتقويم **الهجري الإسلامي**، **الشمسي (الجلالي)**، و**الميلادي (الغريغوري)**.

### 🌟 أبرز المميزات
- 🚀 **رابط التجربة المباشرة:** [https://haedarfarhani.github.io/date-picker-javascript/](https://haedarfarhani.github.io/date-picker-javascript/)
- 🌙 **دعم دقيق للتقويم الهجري:** خوارزميات حسابية دقيقة متوافقة مع تقويم أم القرى وإمكانية تعديل الأيام (`hijriAdjustment`).
- 🔄 **مبدل التقويمات التفاعلي (`calendarSwitcher`):** التبديل بين الهجري والميلادي والشمسي مباشرة من واجهة التقويم دون إغلاق النافذة المنبثقة أو فقدان القيمة.
- 📐 **محرك التاريخ الذكي `SmartDate`:** تحويل التواريخ وحساب السنوات الكبيسة وتنسيق النصوص بالقوالب القياسية (`Y/m/d`, `l j F Y`, `H:i:s`).
- 🎨 **٥ سمات (Themes) و٥ تصاميم (Designs):** سمات `light`، `dark`، `material`، `ios`، و `glass` مع خيارات تصميم متعددة.
- 📱 **واجهة مخصصة للهواتف:** تتحول النافذة تلقائياً في الشاشات الصغيرة إلى Bottom Sheet سهلة اللمس بمساحة 44px لكل يوم.
- ♿ **دعم كامل للوصولية (WAI-ARIA):** التنقل السلس عبر لوحة المفاتيح وقارئات الشاشة ودعم اتجاه النص من اليمين لليسار (RTL).

---

### ١. التثبيت والتهيئة

```bash
# عبر مدير الحزم npm
npm install my-datepicker-core

# أو pnpm
pnpm add my-datepicker-core
```

#### استيراد ملف التنسيقات (CSS):
```css
@import 'my-datepicker-core/styles.css';
```

---

### ٢. البدء السريع (Vanilla JavaScript)

```html
<div id="datepicker-container"></div>

<script type="module">
  import { DatePicker } from 'my-datepicker-core';

  const dp = new DatePicker('#datepicker-container', {
    calendar: 'hijri',        // نوع التقويم: 'hijri' | 'gregorian' | 'jalali'
    mode: 'single',           // وضع الاختيار: 'single' | 'range' | 'multiple'
    value: '1447/03/15',      // القيمة الابتدائية
    pattern: 'Y/m/d',         // صيغة التاريخ
    calendarSwitcher: true,   // تفعيل أزرار التبديل بين التقويمات
    theme: 'light',           // المظهر العام
    design: 'rounded'         // نمط الحواف
  });

  // الاستماع لحدث تغيير التاريخ
  dp.on('change', ({ value, smartDate }) => {
    console.log('التاريخ المحدد:', value);
  });
</script>
```

---

### ٣. جدول الخيارات الكامل (`DatePickerOptions`)

| الخيار | النوع | القيمة الافتراضية | الوصف |
| :--- | :--- | :--- | :--- |
| `calendar` | `'hijri' \| 'gregorian' \| 'jalali'` | `'gregorian'` | نظام التقويم الأساسي للعرض |
| `mode` | `'single' \| 'range' \| 'multiple'` | `'single'` | وضع الاختيار: تاريخ فردي، نطاق زمني، أو تواريخ متعددة |
| `value` | `string \| string[] \| Date \| Date[]` | `null` | القيمة المحددة أولياً |
| `pattern` | `string` | تلقائي | صيغة نص التاريخ المخرج (مثل `'Y/m/d'` أو `'l j F Y'`) |
| `calendarSwitcher`| `boolean` | `false` | إظهار أزرار التبديل السريع بين التقويمات في أعلى النافذة |
| `theme` | `'light' \| 'dark' \| 'material' \| 'ios' \| 'glass'` | `'light'` | سمة الألوان والمظهر |
| `design` | `'default' \| 'rounded' \| 'minimal' \| 'bordered' \| 'compact'` | `'default'` | النمط الهندسي وتنسيق الحدود |
| `layout` | `'popup' \| 'inline' \| 'multi-month'` | `'popup'` | طريقة العرض: نافذة منبثقة، مضمن دائم في الصفحة، أو عرض أشهر متعددة |
| `showTime` | `boolean` | `false` | تمكين اختيار الوقت (الساعات والدقائق) |
| `timeFormat` | `'12h' \| '24h'` | `'24h'` | صيغة عرض الوقت (نظام 24 ساعة أو 12 ساعة مع ص/م) |
| `minDate` | `string \| Date \| SmartDate` | `null` | الحد الأدنى للتاريخ المسموح باختياره |
| `maxDate` | `string \| Date \| SmartDate` | `null` | الحد الأقصى للتاريخ المسموح باختياره |
| `disabledDates` | `string[] \| ((d: SmartDate) => boolean)` | `[]` | مصفوفة أو دالة لتحديد الأيام المعطلة |
| `disabledWeekdays`| `number[]` | `[]` | أيام الأسبوع المعطلة (0 = الأحد، 6 = السبت) |
| `numeralSystem` | `'arab' \| 'latn' \| 'arabext'` | تلقائي | شكل الأرقام: أرقام عربية (١٢٣) أو لاتينية (123) |
| `hijriAdjustment`| `number` | `0` | تعديل التقويم الهجري لرؤية الهلال (من -2 إلى +2 يوم) |
| `hijriPreset` | `'tabular' \| 'umm-alqura' \| 'iranian'`| `'tabular'` | الخوارزمية المعتمدة لحساب الأشهر الهجرية |
| `placeholder` | `string` | `'اختر التاريخ'` | النص التوضيحي لحقل الإدخال |
| `inline` | `boolean` | `false` | تثبيت التقويم مباشرة داخل الصفحة بدون حاجة للضغط |
| `zIndex` | `number` | `1000` | مستوى طبقة العرض فوق العناصر الأخرى |

---

### ٤. دوال الكائن (`Instance Methods`)

```javascript
// فتح نافذة التقويم يدوياً
dp.open();

// إغلاق النافذة
dp.close();

// تبديل حالة الفتح والإغلاق
dp.toggle();

// جلب القيمة المحددة كـ نص
const val = dp.getValue();

// جلب كائن التاريخ الذكي SmartDate للعمليات البرمجية
const smart = dp.getSmartDate();

// تعيين قيمة تاريخ جديدة برمجياً
dp.setValue('1447/04/20');

// مسح القيمة المحددة
dp.clear();

// التبديل بين التقويمات بشكل فوري دون إغلاق النافذة
dp.switchCalendar('hijri'); // أو 'gregorian' أو 'jalali'

// تغيير اللغة
dp.setLocale('ar');

// تنسيق أي تاريخ باستخدام الرموز التعبيرية
const formatted = dp.formatDate(new Date(), 'l j F Y');

// تحليل نص إلى كائن SmartDate
const parsed = dp.parseDate('1447/03/15', 'Y/m/d', 'hijri');

// تحديث الخيارات وإعادة الرسم فورياً
dp.update({ theme: 'dark', design: 'rounded' });

// إزالة المكون وتنظيف الذاكرة
dp.destroy();
```

---

### ٥. جدول الأحداث (`Events`)

```javascript
dp.on('change', ({ value, smartDate }) => {
  console.log('تم تغيير القيمة:', value);
});
```

| الحدث | البيانات (Payload) | الوصف |
| :--- | :--- | :--- |
| `open` | `{}` | يتم إطلاقه عند فتح النافذة المنبثقة |
| `close` | `{}` | يتم إطلاقه عند إغلاق النافذة |
| `select` | `{ date, smartDate, value }` | يتم إطلاقه عند النقر على يوم محدد |
| `change` | `{ value, smartDate }` | يتم إطلاقه عند تأكيد أو تعديل القيمة المختارة |
| `calendar-change` | `{ calendar }` | يتم إطلاقه عند تبديل نظام التقويم |
| `navigate` | `{ year, month, calendar }` | يتم إطلاقه عند الانتقال للشهر أو العام التالي/السابق |
| `clear` | `{}` | يتم إطلاقه عند مسح التاريخ |
| `error` | `{ message }` | يتم إطلاقه عند إدخال قيمة خارج الحدود المسموحة |

---

### ٦. رموز تنسيق التواريخ القياسية (Format Tokens)

| الرمز | الشرح | مثال (بالتقويم الهجري) |
| :---: | :--- | :--- |
| `Y` | السنة المكونة من 4 أرقام | `1447` |
| `y` | السنة المكونة من رقمين | `47` |
| `m` | رقم الشهر مسبوقاً بصفر (01-12) | `03` |
| `n` | رقم الشهر بدون صفر (1-12) | `3` |
| `F` | اسم الشهر كاملاً | `ربيع الأول` |
| `d` | اليوم مسبوقاً بصفر (01-31) | `15` |
| `j` | اليوم بدون صفر (1-31) | `15` |
| `l` | اسم يوم الأسبوع كاملاً | `السبت` |
| `D` | اسم يوم الأسبوع مختصر | `س` |
| `H` | الساعة بصيغة 24 ساعة مسبوقة بصفر | `14` |
| `h` | الساعة بصيغة 12 ساعة مسبوقة بصفر | `02` |
| `i` | الدقائق مسبوقة بصفر | `30` |
| `s` | الثواني مسبوقة بصفر | `00` |
| `a` | مؤشر الوقت (ص / م) | `م` |
| `A` | مؤشر الوقت بالأحرف الكبيرة | `م` / `PM` |

---

### ٧. أمثلة التكامل مع أطر العمل (Frameworks)

#### ١) جافاسكريبت القياسي (Vanilla JavaScript):
```html
<link rel="stylesheet" href="node_modules/my-datepicker-core/styles.css" />
<div id="datepicker"></div>

<script type="module">
  import { DatePicker } from 'my-datepicker-core';

  const dp = new DatePicker('#datepicker', {
    calendar: 'hijri',
    calendarSwitcher: true,
    value: '1447/03/15',
    pattern: 'l j F Y',
    theme: 'light',
    design: 'rounded'
  });

  dp.on('change', ({ value }) => console.log('التاريخ المختار:', value));
</script>
```

#### ٢) ريآكت (React مع Hooks و TypeScript):
```tsx
import React, { useState } from 'react';
import { DatePicker } from 'my-datepicker-react';
import 'my-datepicker-core/styles.css';

export function HijriPickerExample() {
  const [date, setDate] = useState('1447/03/15');

  return (
    <DatePicker
      calendar="hijri"
      calendarSwitcher={true}
      mode="single"
      theme="glass"
      design="rounded"
      pattern="l j F Y"
      value={date}
      onChange={(newVal) => setDate(newVal)}
    />
  );
}
```

#### ٣) فيو (Vue 3 مع v-model):
```vue
<template>
  <DatePicker
    v-model="hijriDate"
    calendar="hijri"
    :calendar-switcher="true"
    theme="ios"
    design="rounded"
    pattern="l j F Y"
  />
</template>

<script setup>
import { ref } from 'vue';
import { DatePicker } from 'my-datepicker-vue';
import 'my-datepicker-core/styles.css';

const hijriDate = ref('1447/03/15');
</script>
```

#### ٤) أنجولار (Angular Standalone Component):
```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MyDatepickerAngular } from 'my-datepicker-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, MyDatepickerAngular],
  template: `
    <my-datepicker-angular
      [(ngModel)]="selectedDate"
      calendar="hijri"
      [calendarSwitcher]="true"
      theme="material"
      design="rounded">
    </my-datepicker-angular>
  `
})
export class AppComponent {
  selectedDate = '1447/03/15';
}
```

---

### ٨. التنقل عبر لوحة المفاتيح (Keyboard Navigation)
- `ArrowRight` / `ArrowLeft`: التنقل بين الأيام (مع مراعاة الاتجاه الطبيعي في العربية).
- `ArrowUp` / `ArrowDown`: الانتقال أسبوعاً للأمام أو للخلف.
- `PageUp` / `PageDown`: الانتقال للشهر السابق أو التالي.
- `Shift + PageUp` / `Shift + PageDown`: الانتقال للسنة السابقة أو التالية.
- `Home` / `End`: الذهاب لأول أو آخر يوم في الشهر.
- `Enter` / `Space`: اختيار اليوم المحدد.
- `Escape`: إغلاق نافذة التقويم واستعادة التركيز لحقل الإدخال.

</div>

---

### 📄 License
This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
Developed with ❤️ by [Haedar Farhani](https://github.com/haedarfarhani).
