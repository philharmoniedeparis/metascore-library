import { useModule } from "@metascore-library/core/services/module-manager";
import JavaScript from "blockly/javascript";
import { unref } from "vue";

const listeners = [];

export function init(context) {
  // Ensure 'Links' name does not conflict with variable names.
  JavaScript.addReservedWords("Links");

  // Add 'Links' object to context.
  context.Links = {
    addEventListener: (id, type, callback) => {
      let { el: root } = useModule("app_renderer");
      root = unref(root);

      /** @type HTMLElement */
      const el = root.querySelector(
        `.metaScore-component.content .contents a[data-behavior-trigger="${id}"]`
      );

      if (!el) return;

      // Add the event listener.
      el.addEventListener(type, callback);

      // Add to list of listeners.
      listeners.push({
        el,
        type,
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
