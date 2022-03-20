import packageInfo from "../../package.json";
import Emitter from "tiny-emitter";
import { createApp } from "vue";
import { createPinia } from "pinia";
import { createI18n } from "vue-i18n";
import hotkey from "v-hotkey";
import App from "./App.vue";

import { registerModules } from "@metascore-library/core/services/module-manager";
import AssetsLibrary from "./modules/assets_library";
import BufferIndicator from "./modules/buffer_indicator";
import ComponentForm from "./modules/component_form";
import ComponentsLibrary from "./modules/components_library";
import ContextMenu from "@metascore-library/core/modules/contextmenu";
import FormControls from "./modules/form_controls";
import MediaSelector from "./modules/media_selector";
import PlaybackControls from "./modules/playback_controls";
import PlayerPreview from "./modules/player_preview";
import ResizablePane from "./modules/resizable_pane";
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

  static async create({ url, el = null, locale = "fr" } = {}) {
    const pinia = createPinia();
    const i18n = createI18n({ locale, fallbackLocale: "fr" });

    const events = new Emitter();
    const app = createApp(App, { url }).use(pinia).use(i18n).use(hotkey);

    // See https://github.com/vuejs/core/pull/5474
    app.config.skipEventsTimestampCheck = true;

    // See https://vuejs.org/guide/components/provide-inject.html#working-with-reactivity
    app.config.unwrapInjectedRef = true;

    app.config.performance = process.env.NODE_ENV === "development";

    // Register root modules.
    const { default: Media } = await import(
      /* webpackChunkName: "Editor.PlayerPreview" */ "@metascore-library/player/modules/media"
    );
    await registerModules(
      [
        AssetsLibrary,
        BufferIndicator,
        ComponentForm,
        ComponentsLibrary,
        ContextMenu,
        FormControls,
        Media,
        MediaSelector,
        PlaybackControls,
        PlayerPreview,
        ResizablePane,
        ScenarioManager,
        SharedAssetsLibrary,
        Tabs,
        Timeline,
        Waveform,
      ],
      { app, pinia }
    );

    return new Editor(app, events, el);
  }

  /**
   * @private
   */
  constructor(app, events, el = null) {
    this._app = app;
    this._events = events;

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
