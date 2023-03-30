import { useModule } from "@metascore-library/core/services/module-manager";
import { javascriptGenerator as JavaScript } from "blockly/javascript";

const states = new Map();

const SET_PROPERTY_OVERRIDES_KEY = "app_behaviors:set_property";
const SET_PROPERTY_OVERRIDES_PRIORITY = 100;

export function init(context) {
  // Ensure 'Components' name does not conflict with variable names.
  JavaScript.addReservedWords("Components");

  // Add 'Components' object to context.
  context.Components = {
    addEventListener: (type, id, event, callback) => {
      const { getComponent } = useModule("app_components");
      const { getComponentElement } = useModule("app_renderer");

      const component = getComponent(type, id);
      if (!component) return;

      /** @type HTMLElement */
      const el = getComponentElement(component);
      if (!el) return;

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
    getProperty: (type, id, name) => {
      const { getComponent } = useModule("app_components");

      const component = getComponent(type, id);
      if (!component) return;

      return component[name];
    },
    setProperty: (type, id, name, value) => {
      const { getComponent, setOverrides } = useModule("app_components");

      const component = getComponent(type, id);
      if (!component) return;

      setOverrides(
        component,
        SET_PROPERTY_OVERRIDES_KEY,
        {
          [name]: value,
        },
        SET_PROPERTY_OVERRIDES_PRIORITY
      );
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
  const { clearOverrides } = useModule("app_components");
  clearOverrides(null, SET_PROPERTY_OVERRIDES_KEY);

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
