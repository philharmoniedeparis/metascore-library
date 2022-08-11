import { useModule } from "@metascore-library/core/services/module-manager";
import JavaScript from "blockly/javascript";
import { append } from "./utils";
import { unref } from "vue";

const listeners = [];

export function init(interpreter, globalObject) {
  // Ensure 'Keyboard' name does not conflict with variable names.
  JavaScript.addReservedWords("Keyboard");

  // Create 'Keyboard' global object.
  const Keyboard = interpreter.nativeToPseudo({});
  interpreter.setProperty(globalObject, "Keyboard", Keyboard);

  // Define 'Keyboard.addEventListener' property.
  interpreter.setProperty(
    Keyboard,
    "addEventListener",
    interpreter.createNativeFunction(function (key, event, callback) {
      let { el } = useModule("app_renderer");
      el = unref(el);

      key = interpreter.pseudoToNative(key);
      event = interpreter.pseudoToNative(event);
      callback = interpreter.pseudoToNative(callback);

      const wrapper = function (evt) {
        if (key === "any" || evt.key === key) {
          append(callback, interpreter);
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

      console.error("addEventListener", listeners);

      return true;
    })
  );
}

export function reset() {
  // Remove all listeners.
  while (listeners.length > 0) {
    const { el, type, callback } = listeners.pop();
    el.removeEventListener(type, callback);
  }
  console.error("reset", listeners);
}
