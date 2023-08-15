import { useModule } from "@metascore-library/core/services/module-manager";
import { javascriptGenerator as JavaScript } from "blockly/javascript";
import { unref } from "vue";

const listeners = [];

export function init(context) {
  // Ensure 'Keyboard' name does not conflict with variable names.
  JavaScript.addReservedWords("Keyboard");

  // Add 'Keyboard' object to context.
  context.Keyboard = {
    addEventListener: (key, event, callback) => {
      let { el } = useModule("app_renderer");
      el = unref(el);

      const wrapper = function (evt) {
        if (key === "any" || evt.key === key) {
          evt.preventDefault();
          callback();
        }
      };

      // Add the event listener.
      el.addEventListener(event, wrapper);

      // Add to list of listeners.
      listeners.push({
        el,
        type: event,
        callback: wrapper,
      });

      return true;
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
