import packageInfo from "../../package.json";
import Emitter from "tiny-emitter";
import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import { createStore } from "./store";
import { createRouter } from "./router";
import App from "./App.vue";

import { registerModules } from "@metascore-library/core/modules/manager.js";
import AssetsLibrary from "./modules/assets_libraray";
import ComponentForm from "./modules/component_form";
import ComponentsLibrary from "./modules/components_library";
import MainMenu from "./modules/mainmenu";
import Panes from "./modules/panes";
import PlaybackControls from "./modules/playback_controls";
import PlayerPreview from "./modules/player_preview";
import Ruler from "./modules/ruler";
import ScenarioManager from "./modules/scenario_manager";
import SharedAssetsLibrary from "./modules/shared_assets_library";
import Tabs from "./modules/tabs";
import Timeline from "./modules/timeline";
import Waveform from "./modules/waveform";

export class Editor {
  /**
   * @type {string} The version identifier
   */
  static version = packageInfo.version;

  constructor({ url, el = null, locale = "fr", debug = false } = {}) {
    const i18n = createI18n({ locale });
    const store = createStore({ debug });
    const router = createRouter({ debug });

    this._events = new Emitter();
    this._app = createApp(App, { url }).use(i18n).use(store).use(router);

    // Register root modules.
    registerModules(
      [
        AssetsLibrary,
        ComponentForm,
        ComponentsLibrary,
        MainMenu,
        Panes,
        PlaybackControls,
        PlayerPreview,
        Ruler,
        ScenarioManager,
        SharedAssetsLibrary,
        Tabs,
        Timeline,
        Waveform,
      ],
      this._app,
      store,
      router
    ).then(() => {
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

  /**
   * Add an event listener
   *
   * @param {string} event The event's name
   * @param {function} callback The callback
   * @returns {this}
   */
  on(event, callback) {
    this._events.on(event, callback);
    return this;
  }

  /**
   * Add a one time event listener
   *
   * @param {string} event The event's name
   * @param {function} callback The callback
   * @returns {this}
   */
  once(event, callback) {
    this._events.once(event, callback);
    return this;
  }

  /**
   * Remove an event listener
   *
   * @param {string} event The event's name
   * @param {function} callback The callback
   * @returns {this}
   */
  off(event, callback) {
    this._events.off(event, callback);
    return this;
  }
}
