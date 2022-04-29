import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";

export default class PostMessageModule extends AbstractModule {
  static id = "post_message";

  constructor({ app }) {
    super(arguments);

    app.provide("$postMessage", {
      send(target, message, targetOrigin = "*") {
        if (!targetOrigin) return;

        try {
          target.postMessage(message, targetOrigin);
        } catch (e) {
          console.error(e);
        }
      },

      on(callback) {
        window.addEventListener("message", callback);
      },

      off(callback) {
        window.removeEventListener("message", callback);
      },
    });
  }
}
