import packageInfo from "../../package.json";
import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import { createStore } from "./store";
import { createPostMessage } from "../core/plugins/post-message";
import VueDOMPurifyHTML from "vue-dompurify-html";
import App from "./App.vue";

export class Player {
  /**
   * @type {string} The version identifier
   */
  static version = packageInfo.version;

  constructor({ url, el, api = false, locale = "fr", debug = false } = {}) {
    const i18n = createI18n({ locale });
    const store = createStore({ debug });

    const postMessage = createPostMessage();

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

    this._app.mount(el);
  }
}
