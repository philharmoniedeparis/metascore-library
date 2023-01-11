import { createI18n } from "vue-i18n";

let instance = null;

export function init(configs) {
  instance = createI18n(configs);
  return instance;
}

export function getLocale() {
  return instance?.global.locale;
}

export function t(...args) {
  if (!instance) {
    throw new Error("Cannot use 't' before initializing the i18n service.");
  }

  return instance.global.t(...args);
}

export function addMessages(messages) {
  if (!instance) {
    throw new Error(
      "Cannot add i18n messages before initializing the i18n service."
    );
  }

  Object.entries(messages).forEach(([locale, value]) => {
    instance.global.mergeLocaleMessage(locale, value);
  });
}
