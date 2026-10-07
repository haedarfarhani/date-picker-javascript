# my-datepicker-core

Framework-agnostic multi-calendar datepicker core with Jalali, Hijri, and Gregorian support.

## Installation

```bash
npm install my-datepicker-core
```

## Quick Start

```ts
import { DatePicker } from 'my-datepicker-core';

const dp = new DatePicker('#datepicker', {
  calendar: 'jalali',
  mode: 'single',
  value: '1404/7/16',
  pattern: 'Y/m/d'
});

dp.on('change', ({ value }) => console.log('Selected:', value));
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `calendar` | `'jalali' \| 'gregorian' \| 'hijri'` | `'gregorian'` | Calendar system |
| `mode` | `'single' \| 'multiple' \| 'range'` | `'single'` | Selection mode |
| `value` | `string \| string[]` | — | Initial selected date(s) |
| `minDate` | `string \| Date` | — | Minimum selectable date |
| `maxDate` | `string \| Date` | — | Maximum selectable date |
| `disabledDates` | `string[] \| ((d: any) => boolean)` | — | Disabled dates array or function |
| `showTime` | `boolean` | `false` | Show time picker |
| `timeFormat` | `'12h' \| '24h'` | `'24h'` | Time display format |
| `theme` | `'light' \| 'dark' \| 'material' \| 'ios' \| 'glass'` | `'light'` | UI theme |
| `design` | `'default' \| 'rounded' \| 'minimal' \| 'bordered' \| 'compact'` | `'default'` | Visual design |
| `layout` | `'popup' \| 'inline' \| 'multi-month'` | `'popup'` | Layout type |
| `inline` | `boolean` | `false` | Always visible inline |
| `placeholder` | `string` | `'Select date'` | Input placeholder |
| `zIndex` | `number` | `1000` | Popup z-index |
| `calendarSwitcher` | `boolean` | `false` | Show calendar switcher |
| `locale` | `string \| Partial<LocaleConfig>` | Auto | Locale code or override config |

## Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `open()` | `() => void` | Open the datepicker popup |
| `close()` | `() => void` | Close the datepicker popup |
| `toggle()` | `() => void` | Toggle open/close |
| `destroy()` | `() => void` | Remove datepicker and cleanup |
| `getValue()` | `() => string \| string[] \| null` | Get formatted date value(s) |
| `getSmartDate()` | `() => SmartDate \| SmartDate[] \| { start: SmartDate; end: SmartDate } \| null` | Get SmartDate object(s) |
| `setValue(v)` | `(v: string \| string[] \| Date \| Date[] \| SmartDate \| SmartDate[]) => void` | Set date value(s) |
| `clear()` | `() => void` | Clear selected date(s) |
| `setLocale(l)` | `(l: string) => void` | Change locale |
| `switchCalendar(c)` | `(c: CalendarType) => void` | Switch calendar system |
| `formatDate(d, pattern?, calendar?)` | `(d: SmartDate \| Date, pattern?: string, calendar?: CalendarType) => string` | Format a SmartDate or Date |
| `parseDate(s, pattern?, calendar?)` | `(s: string, pattern?: string, calendar?: CalendarType) => SmartDate \| null` | Parse a date string |
| `on(event, cb)` | `(event: string, cb: (payload: any) => void) => () => void` | Subscribe to events; returns unsubscribe |
| `update(options)` | `(options: Partial<DatePickerOptions>) => void` | Update options and re-render |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `open` | `{}` | Popup opened |
| `close` | `{}` | Popup closed |
| `change` | `{ value, smartDate }` | Value changed |
| `select` | `{ date, smartDate, value }` | Date selected |
| `clear` | `{}` | Value cleared |
| `navigate` | `{ year, month, calendar }` | Month navigated |
| `calendar-change` | `{ calendar }` | Calendar system changed |
| `error` | `{ message }` | Error occurred |

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `ArrowRight` / `ArrowLeft` | Move focus between days |
| `ArrowDown` / `ArrowUp` | Move to next/previous week |
| `PageDown` / `PageUp` | Next/previous month |
| `Shift + PageDown` / `PageUp` | Next/previous year |
| `Home` / `End` | First/Last day of month |
| `Enter` / `Space` | Select focused day |
| `Escape` | Close popup |

## License

MIT
