import packageInfo from "../../package.json";
import Emitter from "tiny-emitter";
import { createApp } from "vue";
import { createPinia } from "pinia";
import { createI18n } from "vue-i18n";
import App from "./App.vue";

import {
  registerModules,
  useModule,
} from "@metascore-library/core/services/module-manager";
import Ajax from "@metascore-library/core/modules/ajax";
import AssetsLibrary from "./modules/assets_library";
import AutoSave from "./modules/auto_save";
import BehaviorsForm from "./modules/behaviors_form";
import BufferIndicator from "./modules/buffer_indicator";
import ComponentForm from "./modules/component_form";
import ComponentsLibrary from "./modules/components_library";
import Confirm from "@metascore-library/core/modules/confirm";
import ContextMenu from "@metascore-library/core/modules/contextmenu";
import FormControls from "./modules/form_controls";
import History from "./modules/history";
import Hotkey from "./modules/hotkey";
import MediaPlayer from "@metascore-library/core/modules/media_player";
import MediaSelector from "./modules/media_selector";
import PlaybackControls from "./modules/playback_controls";
import AppPreview from "./modules/app_preview";
import ProgressIndicator from "@metascore-library/core/modules/progress_indicator";
import ResizablePane from "./modules/resizable_pane";
import RevisionSelector from "./modules/revision_selector";
import ScenarioManager from "./modules/scenario_manager";
import SharedAssetsLibrary from "./modules/shared_assets_library";
import StyledButton from "@metascore-library/core/modules/styled_button";
import Tabs from "./modules/tabs";
import Timeline from "./modules/timeline";
import Waveform from "./modules/waveform";

export class Editor {
  /**
   * @type {string} The version identifier
   */
  static version = packageInfo.version;

  static async create({ url, el = null, locale = "fr", ...configs } = {}) {
    const pinia = createPinia();
    const i18n = createI18n({ locale, fallbackLocale: "fr" });

    const events = new Emitter();
    const app = createApp(App, { url }).use(pinia).use(i18n);

    // See https://github.com/vuejs/core/pull/5474
    app.config.skipEventsTimestampCheck = true;

    // See https://vuejs.org/guide/components/provide-inject.html#working-with-reactivity
    app.config.unwrapInjectedRef = true;

    app.config.performance = process.env.NODE_ENV === "development";

    await registerModules(
      [
        Ajax,
        AssetsLibrary,
        AutoSave,
        BehaviorsForm,
        BufferIndicator,
        ComponentForm,
        ComponentsLibrary,
        Confirm,
        ContextMenu,
        FormControls,
        History,
        Hotkey,
        MediaPlayer,
        MediaSelector,
        PlaybackControls,
        AppPreview,
        ProgressIndicator,
        ResizablePane,
        RevisionSelector,
        ScenarioManager,
        SharedAssetsLibrary,
        StyledButton,
        Tabs,
        Timeline,
        Waveform,
      ],
      { app, pinia }
    );

    if (configs.modules) {
      Object.entries(configs.modules).forEach(([name, configs]) => {
        const module = useModule(name);
        if (module) module.configure(configs);
      });
    }

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
