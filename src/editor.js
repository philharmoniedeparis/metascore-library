import packageInfo from "../package.json";
import Emitter from "tiny-emitter";
import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import { createStore } from "./store/editor";
import { createRouter } from "./router/editor";
import VueDOMPurifyHTML from "vue-dompurify-html";
import App from "./EditorApp.vue";

import { register as registerModule } from "./modules/manager.js";
import MainMenu from "./modules/editor/mainmenu";
import ComponentForm from "./modules/editor/component_form";
import PlayerPreview from "./modules/editor/player_preview";
import ComponentsLibrary from "./modules/editor/components_library";
import AssetsLibrary from "./modules/editor/assets_libraray";
import SharedAssetsLibrary from "./modules/editor/shared_assets_library";

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
    this._app = createApp(App, { url })
      .use(i18n)
      .use(store)
      .use(router)
      .use(VueDOMPurifyHTML, {
        hooks: {
          afterSanitizeAttributes: (node) => {
            if (node.tagName === "A") {
              node.setAttribute("target", "_blank");
              node.setAttribute("rel", "noopener");
            }
          },
        },
      });

    // Register root modules.
    [
      MainMenu,
      ComponentForm,
      PlayerPreview,
      ComponentsLibrary,
      AssetsLibrary,
      SharedAssetsLibrary,
    ].forEach((module) => {
      registerModule(module, this._app, store, router);
    });

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
