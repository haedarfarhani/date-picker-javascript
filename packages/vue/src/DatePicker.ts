import {
  defineComponent,
  ref,
  onMounted,
  onUnmounted,
  watch,
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
  Design,
  Layout,
  TimeFormat,
  NumeralSystem,
  LocaleConfig,
} from 'my-datepicker-core';

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

export const DatePicker = defineComponent({
  name: 'DatePicker',

  props: {
    modelValue: {
      type: [String, Array, Object] as PropType<any>,
      default: undefined,
    },
    mode: { type: String as PropType<DateMode>, default: undefined },
    locale: { type: [String, Object] as PropType<string | Partial<LocaleConfig>>, default: undefined },
    calendar: { type: String as PropType<CalendarType>, default: undefined },
    calendarSwitcher: { type: Boolean, default: undefined },
    format: { type: String, default: undefined },
    pattern: { type: String, default: undefined },
    minDate: { type: [String, Object] as PropType<any>, default: undefined },
    maxDate: { type: [String, Object] as PropType<any>, default: undefined },
    disabledDates: {
      type: [Array, Function] as PropType<any>,
      default: undefined,
    },
    disabledWeekdays: { type: Array as PropType<number[]>, default: undefined },
    firstDayOfWeek: { type: Number as PropType<FirstDayOfWeek>, default: undefined },
    theme: { type: String as PropType<Theme>, default: undefined },
    design: { type: String as PropType<Design>, default: undefined },
    layout: { type: String as PropType<Layout>, default: undefined },
    showTime: { type: Boolean, default: undefined },
    timeFormat: { type: String as PropType<TimeFormat>, default: undefined },
    inline: { type: Boolean, default: undefined },
    placeholder: { type: String, default: undefined },
    zIndex: { type: Number, default: undefined },
    numeralSystem: { type: String as PropType<NumeralSystem>, default: undefined },
  },

  emits: ['update:modelValue', 'change', 'open', 'close', 'clear', 'calendar-change'],

  setup(props, { emit, expose }) {
    const containerRef = ref<HTMLDivElement | null>(null);
    let instance: DatePickerInstance | null = null;

    onMounted(() => {
      if (!containerRef.value) return;

      const options = mapPropsToOptions(props as unknown as Record<string, unknown>);
      if (props.modelValue !== undefined && props.modelValue !== null) {
        options.value = props.modelValue;
      }

      instance = new DatePickerCore(containerRef.value, options);

      instance.on('change', (payload) => {
        emit('update:modelValue', payload.value);
        emit('change', payload.value, payload.smartDate);
      });
      instance.on('open', () => emit('open'));
      instance.on('close', () => emit('close'));
      instance.on('clear', () => {
        emit('update:modelValue', null);
        emit('clear');
      });
      instance.on('calendar-change', (payload) => emit('calendar-change', payload.calendar));
    });

    onUnmounted(() => {
      instance?.destroy();
      instance = null;
    });

    watch(
      () => props.modelValue,
      (newVal, oldVal) => {
        if (!instance) return;
        if (JSON.stringify(newVal) === JSON.stringify(oldVal)) return;
        if (newVal !== undefined && newVal !== null) {
          instance.setValue(newVal);
        } else {
          instance.clear();
        }
      }
    );

    const optionKeys = [
      'mode', 'locale', 'calendar', 'calendarSwitcher', 'format', 'pattern',
      'minDate', 'maxDate', 'disabledDates', 'disabledWeekdays',
      'firstDayOfWeek', 'theme', 'design', 'layout', 'showTime',
      'timeFormat', 'inline', 'placeholder', 'zIndex', 'numeralSystem',
    ] as const;

    watch(
      () => optionKeys.map((k) => (props as any)[k]),
      () => {
        if (!instance) return;
        instance.update(mapPropsToOptions(props as unknown as Record<string, unknown>));
      }
    );

    expose({
      open: () => instance?.open(),
      close: () => instance?.close(),
      toggle: () => instance?.toggle(),
      getValue: () => instance?.getValue() ?? null,
      getSmartDate: () => instance?.getSmartDate() ?? null,
      setValue: (v: any) => instance?.setValue(v),
      clear: () => instance?.clear(),
      setLocale: (l: string) => instance?.setLocale(l),
      switchCalendar: (c: CalendarType) => instance?.switchCalendar(c),
    });

    return () => h('div', { ref: containerRef });
  },
});
