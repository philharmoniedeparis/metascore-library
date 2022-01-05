export default {
  name: "PostMessage",
  install({ app }) {
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
  },
};
