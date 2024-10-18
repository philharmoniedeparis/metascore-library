import { useModule } from "@core/services/module-manager";
import { watch, nextTick } from "vue";
import AbstractInterpreter from "./AbstractInterpreter";

const SET_PROPERTY_OVERRIDES_KEY = "app_behaviors:set_property";
const SET_PROPERTY_OVERRIDES_PRIORITY = 100;

export default class Components extends AbstractInterpreter {
  constructor() {
    super();

    this._unwatchActiveScenario = null;
    this._addEventListenerStates = new Map();
  }

  getContext() {
    const { activeScenario } = useModule("app_components");
    this._unwatchActiveScenario = watch(activeScenario, this._onScenarioChange);

    return {
      addEventListener: (type, id, event, callback) => {
        if (!this._addEventListenerStates.has(type)) {
          this._addEventListenerStates.set(type, new Map());
        }
        if (!this._addEventListenerStates.get(type).has(id)) {
          this._addEventListenerStates.get(type).set(id, {
            listeners: [],
            cursor: null,
          });
        }

        const state = this._addEventListenerStates.get(type).get(id);

        // Add to list of listeners.
        state.listeners.push({
          type: event,
          callback,
        });

        this._setupListener(type, id, event, callback);
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
        const { getComponent, getBlockActivePage } =
          useModule("app_components");

        const block = getComponent("Block", id);
        if (block) {
          return getBlockActivePage(block);
        }
      },
      setBlockPage: (id, index) => {
        const { getComponent, setBlockActivePage } =
          useModule("app_components");

        const block = getComponent("Block", id);
        if (block) {
          setBlockActivePage(block, index);
        }
      },
    };
  }

  reset() {
    // Remove watcher.
    if (this._unwatchActiveScenario) {
      this._unwatchActiveScenario();
      this._unwatchActiveScenario = null;
    }

    const { clearOverrides } = useModule("app_components");
    clearOverrides(null, SET_PROPERTY_OVERRIDES_KEY);

    // Remove all listeners.
    this._removeListeners();

    // Clear addEventListener states.
    this._addEventListenerStates.clear();
  }

  /**
   * Setup a listener on a component with a given type and id.
   * @param {string} type The component's type
   * @param {string} type The component's id.
   * @param {string} event The event type.
   * @param {function} callback The callback that will be invoked when an event is dispatched.
   */
  _setupListener(type, id, event, callback) {
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
      const state = this._addEventListenerStates.get(type).get(id);
      state.cursor = state.cursor || el.style.cursor;
      el.style.cursor = "pointer";
    }
  }

  /**
   * Remove all listeners.
   */
  _removeListeners() {
    const { getComponent } = useModule("app_components");
    const { getComponentElement } = useModule("app_renderer");

    this._addEventListenerStates.forEach((ids, type) => {
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

  /**
   * Watcher handler invoked when the scenario changes.
   */
  async _onScenarioChange() {
    await nextTick();

    // Update all listeners.
    this._addEventListenerStates.forEach((ids, type) => {
      ids.forEach((state, id) => {
        if (state.listeners) {
          state.listeners.forEach(({ type: event, callback }) => {
            this._setupListener(type, id, event, callback);
          });
        }
      });
    });
  }
}
