import packageInfo from "../package.json";
import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import { createStore } from "./store/player";
import { createPostMessage } from "./plugins/post-message";
import VueDOMPurifyHTML from "vue-dompurify-html";
import App from "./PlayerApp.vue";

export class Player {
  /**
   * @type {string} The version identifier
   */
  static version = packageInfo.version;

  constructor({ url, el, api = false, locale = "fr", debug = false } = {}) {
    const i18n = createI18n({ locale });
    const postMessage = createPostMessage({ debug });
    const store = createStore({ debug });

    this._app = createApp(App, { url, api })
      .use(i18n)
      .use(store)
      .use(postMessage)
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
