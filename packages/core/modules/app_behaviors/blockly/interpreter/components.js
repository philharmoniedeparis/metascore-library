import { useModule } from "@metascore-library/core/services/module-manager";
import useStore from "../../store";
import JavaScript from "blockly/javascript";

const listeners = [];

export function init(context) {
  // Ensure 'Components' name does not conflict with variable names.
  JavaScript.addReservedWords("Components");

  // Add 'Keyboard' object to context.
  context.Components = {
    addEventListener: (type, id, event, callback) => {
      const { getComponent } = useModule("app_components");
      const { getComponentElement } = useModule("app_preview");

      const component = getComponent(type, id);
      if (!component) {
        return;
      }

      /** @type HTMLElement */
      const el = getComponentElement(component);
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
    show: (type, id) => {
      const store = useStore();
      store.setComponentState(type, id, {
        hidden: false,
      });
    },
    hide: (type, id) => {
      const store = useStore();
      store.setComponentState(type, id, {
        hidden: true,
      });
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
