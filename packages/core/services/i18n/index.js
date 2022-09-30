import { createI18n } from "vue-i18n";

let instance = null;

export function init(configs) {
  instance = createI18n(configs);
  return instance;
}

export default instance;

export function t(...args) {
  return instance.global.t(...args);
}
