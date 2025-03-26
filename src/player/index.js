import packageInfo from "../../package.json";
import { createApp } from "vue";
import { createPinia } from "pinia";
import hotkey from "v-hotkey";
import App from "./App.vue";

import { init as createI18n } from "@core/services/i18n";
import { registerModules, useModule } from "@core/services/module-manager";
import Ajax from "@core/modules/ajax";
import API from "./modules/api";
import AppBehaviors from "@core/modules/app_behaviors";
import AppRenderer from "@core/modules/app_renderer";
import ContextMenu from "@core/modules/contextmenu";
import MediaPlayer from "@core/modules/media_player";
import ProgressIndicator from "@core/modules/progress_indicator";

export class Player {
  /**
   * @type {string} The version identifier
   */
  static version = packageInfo.version;

  static async create({ url, el, locale = "fr", ...configs } = {}) {
    const pinia = createPinia();
    const i18n = createI18n({ locale, fallbackLocale: "fr" });
    const app = createApp(App, { url }).use(pinia).use(i18n).use(hotkey);

    app.config.performance = process.env.NODE_ENV === "development";

    // Register root modules.
    await registerModules(
      [
        Ajax,
        API,
        AppBehaviors,
        AppRenderer,
        ContextMenu,
        MediaPlayer,
        ProgressIndicator,
      ],
      {
        app,
        i18n,
        pinia,
      }
    );

    if (configs.modules) {
      Object.entries(configs.modules).forEach(([name, configs]) => {
        const module = useModule(name);
        if (module && module.configure) module.configure(configs);
      });
    }

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
