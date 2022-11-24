import { useModule } from "@metascore-library/core/services/module-manager";
import useStore from "../../store";
import { javascriptGenerator as JavaScript } from "blockly/javascript";

const states = new Map();

export function init(context) {
  // Ensure 'Components' name does not conflict with variable names.
  JavaScript.addReservedWords("Components");

  // Add 'Components' object to context.
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

      if (!states.has(el)) {
        states.set(el, {});
      }

      const state = states.get(el);
      state.listeners = state.listeners || [];

      if (event === "click") {
        state.cursor = state.cursor || el.style.cursor;
        el.style.cursor = "pointer";
      }

      // Add to list of listeners.
      state.listeners.push({
        type: event,
        callback,
      });
    },
    setScenario: (id) => {
      const { setActiveScenario } = useModule("app_components");
      setActiveScenario(id);
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
    getProperty: (type, id, name) => {
      const { getComponent } = useModule("app_components");

      const component = getComponent(type, id);
      if (!component) {
        return;
      }

      return component[name];
    },
    setProperty: (type, id, name, value) => {
      const store = useStore();
      store.setComponentState(type, id, {
        [name]: value,
      });
    },
    getBlockPage: (id) => {
      const { getComponent, getBlockActivePage } = useModule("app_components");

      const block = getComponent("Block", id);
      if (block) {
        return getBlockActivePage(block);
      }
    },
    setBlockPage: (id, index) => {
      const { getComponent, setBlockActivePage } = useModule("app_components");

      const block = getComponent("Block", id);
      if (block) {
        setBlockActivePage(block, index);
      }
    },
  };
}

export function reset() {
  states.forEach((state, el) => {
    // Remove all listeners.
    const { listeners, cursor } = state;
    if (listeners) {
      while (listeners.length > 0) {
        const { type, callback } = listeners.pop();
        el.removeEventListener(type, callback);
      }
    }
    // Reset cursor.
    if (typeof cursor !== "undefined") {
      el.style.cursor = cursor;
    }
  });

  // Clear states.
  states.clear();
}
