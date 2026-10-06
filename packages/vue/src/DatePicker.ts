import {
  defineComponent,
  ref,
  onMounted,
  onUnmounted,
  watch,
  expose,
  h,
  type PropType,
} from 'vue';
import { DatePicker as DatePickerCore } from 'my-datepicker-core';
import type {
  DatePickerOptions,
  DatePickerInstance,
  DateMode,
  CalendarType,
  FirstDayOfWeek,
  Theme,
  TimeFormat,
  LocaleConfig,
} from 'my-datepicker-core';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapPropsToOptions(props: Record<string, unknown>): Partial<DatePickerOptions> {
  const {
    modelValue: _mv,
    onChange: _oc,
    onOpen: _oo,
    onClose: _cl,
    onClear: _cr,
    class: _class,
    style: _style,
    ...rest
  } = props;
  return rest as Partial<DatePickerOptions>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Vue 3 wrapper for my-datepicker-core.
 *
 * Usage:
 *   <DatePicker v-model="date" locale="fa-IR" />
 *
 * Exposes: open / close / toggle / getValue / setValue / clear / setLocale
 */
export const DatePicker = defineComponent({
  name: 'DatePicker',

  props: {
    /** v-model binding (controlled value) */
    modelValue: {
      type: [String, Array] as PropType<string | string[] | null | undefined>,
      default: undefined,
    },
    mode: {
      type: String as PropType<DateMode>,
      default: undefined,
    },
    locale: {
      type: [String, Object] as PropType<string | Partial<LocaleConfig>>,
      default: undefined,
    },
    calendar: {
      type: String as PropType<CalendarType>,
      default: undefined,
    },
    format: { type: String, default: undefined },
    minDate: { type: String, default: undefined },
    maxDate: { type: String, default: undefined },
    disabledDates: {
      type: [Array, Function] as PropType<string[] | ((d: Date) => boolean)>,
      default: undefined,
    },
    firstDayOfWeek: {
      type: Number as PropType<FirstDayOfWeek>,
      default: undefined,
    },
    theme: {
      type: String as PropType<Theme>,
      default: undefined,
    },
    showTime: { type: Boolean, default: undefined },
    timeFormat: {
      type: String as PropType<TimeFormat>,
      default: undefined,
    },
    inline: { type: Boolean, default: undefined },
    placeholder: { type: String, default: undefined },
    zIndex: { type: Number, default: undefined },
  },

  emits: ['update:modelValue', 'change', 'open', 'close', 'clear'],

  setup(props, { emit, expose: vueExpose }) {
    const containerRef = ref<HTMLDivElement | null>(null);
    let instance: DatePickerInstance | null = null;

    // ---- Mount ----
    onMounted(() => {
      if (!containerRef.value) return;

      const options = mapPropsToOptions(props as unknown as Record<string, unknown>);
      // Set initial value
      if (props.modelValue !== undefined && props.modelValue !== null) {
        options.value = props.modelValue as string | string[];
      }

      instance = new DatePickerCore(containerRef.value, options);

      instance.on('change', (payload) => {
        emit('update:modelValue', payload.value);
        emit('change', payload.value);
      });
      instance.on('open', () => emit('open'));
      instance.on('close', () => emit('close'));
      instance.on('clear', () => {
        emit('update:modelValue', null);
        emit('clear');
      });
    });

    // ---- Unmount ----
    onUnmounted(() => {
      instance?.destroy();
      instance = null;
    });

    // ---- Sync modelValue ----
    watch(
      () => props.modelValue,
      (newVal, oldVal) => {
        if (!instance) return;
        if (JSON.stringify(newVal) === JSON.stringify(oldVal)) return;
        if (newVal !== undefined && newVal !== null) {
          instance.setValue(newVal as string | string[]);
        } else {
          instance.clear();
        }
      }
    );

    // ---- Sync other options ----
    const optionKeys = [
      'mode', 'locale', 'calendar', 'format', 'minDate', 'maxDate',
      'disabledDates', 'firstDayOfWeek', 'theme', 'showTime',
      'timeFormat', 'inline', 'placeholder', 'zIndex',
    ] as const;

    watch(
      () => optionKeys.map((k) => (props as any)[k]),
      () => {
        if (!instance) return;
        instance.update(mapPropsToOptions(props as unknown as Record<string, unknown>));
      }
    );

    // ---- Expose imperative API ----
    vueExpose({
      open: () => instance?.open(),
      close: () => instance?.close(),
      toggle: () => instance?.toggle(),
      getValue: () => instance?.getValue() ?? null,
      setValue: (v: string | string[]) => instance?.setValue(v),
      clear: () => instance?.clear(),
      setLocale: (l: string) => instance?.setLocale(l),
    });

    return () => h('div', { ref: containerRef });
  },
});
