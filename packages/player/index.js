import packageInfo from "../../package.json";
import { createApp } from "vue";
import { createPinia } from "pinia";
import { createI18n } from "vue-i18n";
import hotkey from "v-hotkey";
import store from "./store";
import App from "./App.vue";

import {
  registerModules,
  registerStore,
} from "@metascore-library/core/module-manager.js";
import AppRenderer from "./modules/app_renderer";
import ContextMenu from "@metascore-library/core/modules/context_menu";

export class Player {
  /**
   * @type {string} The version identifier
   */
  static version = packageInfo.version;

  constructor({ url, el, api = false, locale = "fr" } = {}) {
    const pinia = createPinia();
    const i18n = createI18n({ locale });

    this._app = createApp(App, { url, api }).use(pinia).use(i18n).use(hotkey);

    // Register the root store.
    registerStore("player", store);

    // Register root modules.
    registerModules([AppRenderer, ContextMenu], { app: this._app, pinia }).then(
      () => {
        if (el) {
          this.mount(el);
        }
      }
    );
  }

  /**
   * Mount the app to the specified DOM element
   *
   * @param {DOMElement} el The DOM element
   * @returns {this}
   */
  mount(el) {
    if (!this._root) {
      this._root = this._app.mount(el);
    }
    return this;
  }
}
