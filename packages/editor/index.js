import { version } from '../../package.json'
import { TinyEmitter } from 'tiny-emitter'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import { init as createI18n } from '@core/services/i18n'
import { registerModules, useModule } from '@core/services/module-manager'
import Ajax from '@core/modules/ajax'
import AppBehaviors from '@core/modules/app_behaviors'
import AppPreview from './modules/app_preview'
import AppRenderer from '@core/modules/app_renderer'
import AssetsManager from '@core/modules/assets_manager'
import AssetsLibrary from './modules/assets_library'
import AutoSave from './modules/auto_save'
import BaseButton from '@core/modules/button'
import BehaviorsForm from './modules/behaviors_form'
import BufferIndicator from './modules/buffer_indicator'
import ComponentForm from './modules/component_form'
import ComponentsLibrary from './modules/components_library'
import ComponentsBreadcrumb from './modules/components_breadcrumb'
import Confirm from '@core/modules/confirm'
import ContextMenu from '@core/modules/contextmenu'
import FormControls from './modules/form_controls'
import History from './modules/history'
import Hotkey from './modules/hotkey'
import Intro from './modules/intro'
import MediaPlayer from '@core/modules/media_player'
import MediaSelector from './modules/media_selector'
import PlaybackControls from './modules/playback_controls'
import ProgressIndicator from '@core/modules/progress_indicator'
import ResizablePane from './modules/resizable_pane'
import RevisionSelector from './modules/revision_selector'
import ScenarioManager from './modules/scenario_manager'
import SharedAssetsLibrary from './modules/shared_assets_library'
import Tabs from './modules/tabs'
import Timeline from './modules/timeline'
import Tooltip from './modules/tooltip'
import UserPreferences from './modules/user_preferences'
import Waveform from './modules/waveform'

let publicPath = '/';
try {
  publicPath = new URL('./', document.currentScript?.src ?? import.meta.url).href;
} catch (e) {
  console.error(e)
}

export class Editor {
  /**
   * @type {string} The version identifier
   */
  static get version() {
    return version;
  }

  static async create({ url, el = null, locale = 'fr', ...configs } = {}) {
    const pinia = createPinia()
    const i18n = createI18n({ locale, fallbackLocale: 'fr' })
    const events = new TinyEmitter()
    const app = createApp(App, { url })

    app.use(pinia)
    app.use(i18n)

    // Add webpack's public path as a global property.

    app.config.globalProperties.publicPath = publicPath

    app.config.performance = import.meta.env.DEV

    await registerModules(
      [
        Ajax,
        AppBehaviors,
        AppPreview,
        AppRenderer,
        AssetsManager,
        AssetsLibrary,
        AutoSave,
        BaseButton,
        BehaviorsForm,
        BufferIndicator,
        ComponentForm,
        ComponentsLibrary,
        ComponentsBreadcrumb,
        Confirm,
        ContextMenu,
        FormControls,
        History,
        Hotkey,
        Intro,
        MediaPlayer,
        MediaSelector,
        PlaybackControls,
        ProgressIndicator,
        ResizablePane,
        RevisionSelector,
        ScenarioManager,
        SharedAssetsLibrary,
        Tabs,
        Timeline,
        Tooltip,
        UserPreferences,
        Waveform,
      ],
      { app, i18n, pinia },
    )

    if (configs.modules) {
      Object.entries(configs.modules).forEach(([name, configs]) => {
        const module = useModule(name)
        if (module && module.configure) module.configure(configs)
      })
    }

    return new Editor(app, events, el)
  }

  /**
   * @private
   */
  constructor(app, events, el = null) {
    this._app = app
    this._events = events

    if (el) {
      this.mount(el)
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
      this._root = this._app.mount(el)
    }
    return this
  }

  /**
   * Add an event listener
   *
   * @param {string} event The event's name
   * @param {function} callback The callback
   * @returns {this}
   */
  on(event, callback) {
    this._events.on(event, callback)
    return this
  }

  /**
   * Add a one time event listener
   *
   * @param {string} event The event's name
   * @param {function} callback The callback
   * @returns {this}
   */
  once(event, callback) {
    this._events.once(event, callback)
    return this
  }

  /**
   * Remove an event listener
   *
   * @param {string} event The event's name
   * @param {function} callback The callback
   * @returns {this}
   */
  off(event, callback) {
    this._events.off(event, callback)
    return this
  }
}
