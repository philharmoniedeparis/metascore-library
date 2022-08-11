import { useModule } from "@metascore-library/core/services/module-manager";
import JavaScript from "blockly/javascript";
import { append } from "./utils";

const listeners = [];

export function init(interpreter, globalObject) {
  // Ensure 'Components' name does not conflict with variable names.
  JavaScript.addReservedWords("Components");

  // Create 'Components' global object.
  const Components = interpreter.nativeToPseudo({});
  interpreter.setProperty(globalObject, "Components", Components);

  // Define 'Components.addEventListener' property.
  interpreter.setProperty(
    Components,
    "addEventListener",
    interpreter.createNativeFunction(function (type, id, event, callback) {
      const { getComponent } = useModule("app_components");
      const { getComponentElement } = useModule("app_preview");

      type = interpreter.pseudoToNative(type);
      id = interpreter.pseudoToNative(id);
      event = interpreter.pseudoToNative(event);
      callback = interpreter.pseudoToNative(callback);

      const component = getComponent(type, id);
      if (!component) {
        return;
      }

      /** @type HTMLElement */
      const el = getComponentElement(component);
      if (!el) {
        return;
      }

      const wrapper = function () {
        append(callback, interpreter);
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
    })
  );
}

export function reset() {
  // Remove all listeners.
  while (listeners.length > 0) {
    const { el, type, callback } = listeners.pop();
    el.removeEventListener(type, callback);
  }
}
