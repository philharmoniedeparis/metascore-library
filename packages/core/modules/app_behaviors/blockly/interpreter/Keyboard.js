import { javascriptGenerator as JavaScript } from "blockly/javascript";
import { useModule } from "@core/services/module-manager";
import { unref } from "vue";
import AbstractInterpreter from "./AbstractInterpreter";

export default class Keyboard extends AbstractInterpreter {
  constructor() {
    super();

    // Ensure context name does not conflict with variable names.
    JavaScript.addReservedWords("Keyboard");

    this._listeners = [];
  }

  get context() {
    return {
      Keyboard: {
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
          this._listeners.push({
            el,
            type: event,
            callback: wrapper,
          });

          return true;
        },
      },
    };
  }

  reset() {
    // Remove all listeners.
    while (this._listeners.length > 0) {
      const { el, type, callback } = this._listeners.pop();
      el.removeEventListener(type, callback);
    }
  }
}
