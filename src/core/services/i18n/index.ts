import { createI18n, type I18n, type VueI18n, type VueI18nOptions } from "vue-i18n";

let instance = null as I18n|null;

export function init(options: VueI18nOptions) {
  instance = createI18n({
    silentFallbackWarn: true,
    ...options,
  });
  return instance;
}

export function getLocale() {
  return instance?.global.locale;
}

export function t(key: string, named?: Record<string, unknown>) {
  if (!instance) {
    throw new Error("Cannot use 't' before initializing the i18n service.");
  }

  const i18n = (instance.global as VueI18n)
  return named ? i18n.t(key, named) : i18n.t(key);
}

export function addMessages(messages: Record<string, unknown>) {
  if (!instance) {
    throw new Error(
      "Cannot add i18n messages before initializing the i18n service."
    );
  }

  Object.entries(messages).forEach(([locale, value]) => {
    instance!.global.mergeLocaleMessage(locale, value);
  });
}
