import packageInfo from "../../package.json";
import { createApp } from "vue";
import { createPinia } from "pinia";
import { createI18n } from "vue-i18n";
import hotkey from "v-hotkey";
import App from "./App.vue";

import { registerModules } from "@metascore-library/core/services/module-manager";
import AppRenderer from "./modules/app_renderer";
import ContextMenu from "@metascore-library/core/modules/contextmenu";

export class Player {
  /**
   * @type {string} The version identifier
   */
  static version = packageInfo.version;

  static async create({ url, el, api = false, locale = "fr" } = {}) {
    const pinia = createPinia();
    const i18n = createI18n({ locale, fallbackLocale: "fr" });

    const app = createApp(App, { url, api }).use(pinia).use(i18n).use(hotkey);

    // Register root modules.
    await registerModules([AppRenderer, ContextMenu], { app, pinia });

    return new Player(app, el);
  }

  /**
   * @private
   */
  constructor(app, el = null) {
    this._app = app;

    if (el) {
      this.mount(el);
    }
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
