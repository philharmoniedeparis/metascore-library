import packageInfo from "../../package.json";
import Emitter from "tiny-emitter";
import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import { createStore } from "./store";
import { createRouter } from "./router";
import { createPostMessage } from "../core/plugins/post-message";
import { registerModule } from "./moduleManager.js";
import App from "@/editor/App.vue";

import MainMenu from "./modules/mainmenu";
import ComponentForm from "./modules/component_form";

export class Editor {
  /**
   * @type {string} The version identifier
   */
  static version = packageInfo.version;

  constructor({ el = null, locale = "fr", debug = false } = {}) {
    const i18n = createI18n({ locale });
    const store = createStore({ debug });
    const router = createRouter({ debug });

    const postMessage = createPostMessage();

    this._events = new Emitter();
    this._app = createApp(App, {})
      .use(i18n)
      .use(store)
      .use(router)
      .use(postMessage);

    registerModule(MainMenu, this._app, store, router);
    registerModule(ComponentForm, this._app, store, router);

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
