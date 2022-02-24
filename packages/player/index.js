import packageInfo from "../../package.json";
import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import { createStore } from "./store";
import App from "./App.vue";

import { registerModules } from "@metascore-library/core/module-manager.js";
import AppRenderer from "./modules/app_renderer";
import ContextMenu from "@metascore-library/core/modules/context_menu";

export class Player {
  /**
   * @type {string} The version identifier
   */
  static version = packageInfo.version;

  constructor({ url, el, api = false, locale = "fr", debug = false } = {}) {
    const i18n = createI18n({ locale });
    const store = createStore({ debug });

    this._app = createApp(App, { url, api }).use(i18n).use(store);

    // Register root modules.
    registerModules([AppRenderer, ContextMenu], this._app, store).then(() => {
      if (el) {
        this.mount(el);
      }
    });
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
