import type { LocaleConfig } from '../types';
import en from './en';
import fa from './fa';
import ar from './ar';

const LOCALES: Record<string, LocaleConfig> = { 'en-US': en, 'fa-IR': fa, 'ar-SA': ar };

export function getLocale(code: string): LocaleConfig {
  if (LOCALES[code]) return LOCALES[code];
  const lang = code.split('-')[0];
  if (lang === 'fa') return LOCALES['fa-IR'];
  if (lang === 'ar') return LOCALES['ar-SA'];
  return LOCALES['en-US'];
}

export function mergeLocale(base: LocaleConfig, overrides?: Partial<LocaleConfig>): LocaleConfig {
  if (!overrides) return base;
  return { ...base, ...overrides };
}

export { en, fa, ar };
