import { useModule } from "@metascore-library/core/services/module-manager";
import JavaScript from "blockly/javascript";
import { unref } from "vue";

const listeners = [];

export function init(context) {
  // Ensure 'Links' name does not conflict with variable names.
  JavaScript.addReservedWords("Links");

  // Add 'Links' object to context.
  context.Links = {
    addEventListener: (id, event, callback) => {
      let { el: root } = useModule("app_renderer");
      root = unref(root);

      /** @type HTMLElement */
      const el = root.querySelector(
        `.metaScore-component.content .contents a[data-behavior="${id}"]`
      );
      if (!el) {
        return;
      }

      // Add the event listener.
      el.addEventListener(event, callback);

      // Add to list of listeners.
      listeners.push({
        el,
        type: event,
        callback,
      });
    },
    openUrl: (url) => {
      window.open(url, "_blank");
    },
  };
}

export function reset() {
  // Remove all listeners.
  while (listeners.length > 0) {
    const { el, type, callback } = listeners.pop();
    el.removeEventListener(type, callback);
  }
}
