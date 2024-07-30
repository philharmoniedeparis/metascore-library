import { useModule } from "@core/services/module-manager";
import { javascriptGenerator as JavaScript } from "blockly/javascript";
import { watch, nextTick } from "vue";

let unwatchActiveScenario = null;
const addEventListenerStates = new Map();

const SET_PROPERTY_OVERRIDES_KEY = "app_behaviors:set_property";
const SET_PROPERTY_OVERRIDES_PRIORITY = 100;

export function init(context) {
  // Ensure 'Components' name does not conflict with variable names.
  JavaScript.addReservedWords("Components");

  const { activeScenario } = useModule("app_components");
  unwatchActiveScenario = watch(activeScenario, onScenarioChange);

  // Add 'Components' object to context.
  context.Components = {
    addEventListener: (type, id, event, callback) => {
      if (!addEventListenerStates.has(type)) {
        addEventListenerStates.set(type, new Map());
      }
      if (!addEventListenerStates.get(type).has(id)) {
        addEventListenerStates.get(type).set(id, {
          listeners: [],
          cursor: null,
        });
      }

      const state = addEventListenerStates.get(type).get(id);

      // Add to list of listeners.
      state.listeners.push({
        type: event,
        callback,
      });

      setupListener(type, id, event, callback);
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

/**
 * Setup a listener on a component with a given type and id.
 * @param {string} type The component's type
 * @param {string} type The component's id.
 * @param {string} event The event type.
 * @param {function} callback The callback that will be invoked when an event is dispatched.
 */
function setupListener(type, id, event, callback) {
  const { getComponent } = useModule("app_components");
  const { getComponentElement } = useModule("app_renderer");

  const component = getComponent(type, id);
  if (!component) return;

  /** @type HTMLElement */
  const el = getComponentElement(component);
  if (!el) return;

  // Add the event listener.
  el.addEventListener(event, callback);

  if (event === "click") {
    const state = addEventListenerStates.get(type).get(id);
    state.cursor = state.cursor || el.style.cursor;
    el.style.cursor = "pointer";
  }
}

/**
 * Remove all listeners.
 */
function removeListeners() {
  const { getComponent } = useModule("app_components");
  const { getComponentElement } = useModule("app_renderer");

  addEventListenerStates.forEach((ids, type) => {
    ids.forEach((state, id) => {
      const component = getComponent(type, id);
      if (!component) return;

      /** @type HTMLElement */
      const el = getComponentElement(component);
      if (!el) return;

      if (!state.listeners) return;

      state.listeners.forEach(({ type, callback }) => {
        el.removeEventListener(type, callback);

        // Reset cursor.
        if (typeof state.cursor !== "undefined") {
          el.style.cursor = state.cursor;
        }
      });
    });
  });
}

export function reset() {
  // Remove watcher.
  if (unwatchActiveScenario) {
    unwatchActiveScenario();
    unwatchActiveScenario = null;
  }

  const { clearOverrides } = useModule("app_components");
  clearOverrides(null, SET_PROPERTY_OVERRIDES_KEY);

  // Remove all listeners.
  removeListeners();

  // Clear addEventListener states.
  addEventListenerStates.clear();
}

/**
 * Watcher handler invoked when the scenario changes.
 */
async function onScenarioChange() {
  await nextTick();

  // Update all listeners.
  addEventListenerStates.forEach((ids, type) => {
    ids.forEach((state, id) => {
      if (state.listeners) {
        state.listeners.forEach(({ type: event, callback }) => {
          setupListener(type, id, event, callback);
        });
      }
    });
  });
}
