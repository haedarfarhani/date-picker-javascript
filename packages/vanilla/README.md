# @haedarfarhanii/my-datepicker

Multi-calendar datepicker library with Jalali, Hijri, and Gregorian support. Vanilla JS / UMD entry.

## Installation

```bash
npm install @haedarfarhanii/my-datepicker
```

## Quick Start

```ts
import { DatePicker } from '@haedarfarhanii/my-datepicker';

const dp = new DatePicker('#datepicker', {
  calendar: 'jalali',
  mode: 'single',
  value: '1404/7/16',
  pattern: 'Y/m/d'
});

dp.on('change', ({ value }) => console.log('Selected:', value));
```

## Usage with script tag

```html
<script src="https://unpkg.com/@haedarfarhanii/my-datepicker/dist/index.umd.js"></script>
<script>
  const dp = new MyDatepicker.DatePicker('#datepicker', {
    calendar: 'jalali',
    mode: 'single'
  });
</script>
```

## Options

See [my-datepicker-core README](https://github.com/haedarfarhani/date-picker-javascript/blob/main/packages/core/README.md) for full options reference.

## License

MIT
