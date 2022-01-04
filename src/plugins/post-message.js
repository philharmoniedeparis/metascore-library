export function createPostMessage({ debug = false } = {}) {
  return {
    install: (app) => {
      app.provide("$postMessage", {
        send(target, message, targetOrigin = "*") {
          if (!targetOrigin) return;

          if (debug) {
            console.log("$postMessage.send", target, message, targetOrigin);
          }

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
}
