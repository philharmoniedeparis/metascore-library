import packageInfo from "../../package.json";
import { createApp } from "vue";
import { createPinia } from "pinia";
import hotkey from "v-hotkey";
import App from "./App.vue";

import { init as createI18n } from "@metascore-library/core/services/i18n";
import { registerModules } from "@metascore-library/core/services/module-manager";
import Ajax from "@metascore-library/core/modules/ajax";
import API from "./modules/api";
import AppBehaviors from "@metascore-library/core/modules/app_behaviors";
import AppRenderer from "@metascore-library/core/modules/app_renderer";
import ContextMenu from "@metascore-library/core/modules/contextmenu";
import ProgressIndicator from "@metascore-library/core/modules/progress_indicator";

export class Player {
  /**
   * @type {string} The version identifier
   */
  static version = packageInfo.version;

  static async create({
    url,
    el,
    api = false,
    responsive = false,
    allowUpscaling = false,
    locale = "fr",
  } = {}) {
    const pinia = createPinia();
    const i18n = createI18n({ locale, fallbackLocale: "fr" });

    const app = createApp(App, { url, api, responsive, allowUpscaling })
      .use(pinia)
      .use(i18n)
      .use(hotkey);

    // See https://vuejs.org/guide/components/provide-inject.html#working-with-reactivity
    app.config.unwrapInjectedRef = true;

    app.config.performance = process.env.NODE_ENV === "development";

    // Register root modules.
    await registerModules(
      [Ajax, API, AppBehaviors, AppRenderer, ContextMenu, ProgressIndicator],
      {
        app,
        i18n,
        pinia,
      }
    );

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
