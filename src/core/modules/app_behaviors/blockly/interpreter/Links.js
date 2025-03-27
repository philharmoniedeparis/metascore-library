import { javascriptGenerator as JavaScript } from "blockly/javascript";
import { useModule } from "@core/services/module-manager";
import { unref, watch, nextTick } from "vue";
import AbstractInterpreter from "./AbstractInterpreter";

export default class Links extends AbstractInterpreter {
  constructor() {
    super();

    // Ensure context name does not conflict with variable names.
    JavaScript.addReservedWords("Links");

    this._unwatchActiveScenario = null;
    this._listenerStates = new Map();
    this._autoHighlights = new Set();
  }

  get context() {
    const { activeScenario } = useModule("core:app_components");
    this._unwatchActiveScenario = watch(
      activeScenario,
      this._onScenarioChange.bind(this)
    );

    return {
      Links: {
        addEventListener: (trigger, event, callback) => {
          (Array.isArray(trigger) ? trigger : [trigger])
            .filter((trigger) => !!trigger)
            .forEach((trigger) => {
              this._addEventListener(trigger, event, callback);
            });
        },
        openUrl: (url) => {
          window.open(url, "_blank");
        },
        autoHighlight: (...args) => {
          this._setupAutoHighlight(...args);
        },
      },
    };
  }

  reset() {
    // Remove watcher.
    if (this._unwatchActiveScenario) {
      this._unwatchActiveScenario();
      this._unwatchActiveScenario = null;
    }

    // Remove all this._listeners.
    this._removeListeners();

    // Clear addEventListener states.
    this._listenerStates.clear();

    // Remove all autohighlight cuepoints.
    this._removeAutoHighlights();

    // Clear the list of auto highlights.
    this._autoHighlights.clear();
  }

  /**
   * Get link elements by trigger id.
   * @param {string} id The trigger id.
   * @returns {[HTMLElement]} The links
   */
  _getLinks(id) {
    let { el: root } = useModule("core:app_renderer");
    root = unref(root);

    return root.querySelectorAll(
      `.metaScore-component.content .contents a[data-behavior-trigger="${id}"]`
    );
  }

  _addEventListener(trigger, event, callback) {
    const [type, id] = trigger.split(":");

    if (!this._listenerStates.has(type)) {
      this._listenerStates.set(type, new Map());
    }
    if (!this._listenerStates.get(type).has(id)) {
      this._listenerStates.get(type).set(id, { listeners: [], cursor: null });
    }

    // Add to list of listeners.
    const state = this._listenerStates.get(type).get(id);
    state.listeners.push({ type: event, callback });

    this._setupListener(type, id, event, callback);
  }

  /**
   * Setup a listener on a trigger.
   * @param {string} type The trigger's type
   * @param {string} id The trigger's id
   * @param {string} event The event type to add the listener on.
   * @param {function} callback The callback that will be invoked when an event is dispatched.
   */
  _setupListener(type, id, event, callback) {
    if (type === "BehaviorTrigger") {
      /** @type [HTMLElement] */
      const links = this._getLinks(id);
      if (links.length === 0) return;

      // Add the event listener.
      links.forEach((link) => {
        link.addEventListener(event, callback);
      });
    } else {
      const { getComponent } = useModule("core:app_components");
      const { getComponentElement } = useModule("core:app_renderer");

      const component = getComponent(type, id);
      if (!component) return;

      /** @type HTMLElement */
      const el = getComponentElement(component);
      if (!el) return;

      // Add the event listener.
      el.addEventListener(event, callback);

      if (event === "click") {
        const state = this._listenerStates.get(type).get(id);
        state.cursor = state.cursor || el.style.cursor;
        el.style.cursor = "pointer";
      }
    }
  }

  /**
   * Remove all listeners.
   */
  _removeListeners() {
    const { getComponent } = useModule("core:app_components");
    const { getComponentElement } = useModule("core:app_renderer");

    this._listenerStates.forEach((ids, type) => {
      ids.forEach((state, id) => {
        if (!state.listeners) return;

        if (type === "BehaviorTrigger") {
          /** @type [HTMLElement] */
          const links = this._getLinks(id);
          links.forEach((link) => {
            state.listeners.forEach(({ type, callback }) => {
              link.removeEventListener(type, callback);
            });
          });
        } else {
          const component = getComponent(type, id);
          if (!component) return;

          /** @type HTMLElement */
          const el = getComponentElement(component);
          if (!el) return;

          state.listeners.forEach(({ type, callback }) => {
            el.removeEventListener(type, callback);

            // Reset cursor.
            if (typeof state.cursor !== "undefined") {
              el.style.cursor = state.cursor;
            }
          });
        }
      });
    });
  }

  /**
   * Setup auto-highlighting on links with a given behavior-trigger id.
   * @param {string} id The behavior-trigger id
   * @param {number} from The start-time in seconds at which the link should be highlighted.
   * @param {number} to The end-time in seconds at which the link should be highlighted.
   */
  _setupAutoHighlight(trigger, from, to) {
    const [, id] = trigger.split(":");

    /** @type [HTMLElement] */
    const links = this._getLinks(id);

    if (links.length === 0) return;

    let { linksAutoHighlightClass } = useModule("core:app_components");
    const { addCuepoint } = useModule("core:media_cuepoints");

    const cuepoint = addCuepoint({
      startTime: from,
      endTime: to,
      onStart: () => {
        links.forEach((link) => {
          link.classList.add(linksAutoHighlightClass);
        });
      },
      onStop: () => {
        links.forEach((link) => {
          link.classList.remove(linksAutoHighlightClass);
        });
      },
      onDestroy: () => {
        links.forEach((link) => {
          link.classList.remove(linksAutoHighlightClass);
        });
      },
    });
    this._autoHighlights.add({ id, from, to, cuepoint });
  }

  /**
   * Remove all auto-highlighting.
   */
  _removeAutoHighlights() {
    const { removeCuepoint } = useModule("core:media_cuepoints");
    this._autoHighlights.forEach(({ cuepoint }) => {
      removeCuepoint(cuepoint);
    });
  }

  /**
   * Watcher handler invoked when the scenario changes.
   */
  async _onScenarioChange() {
    await nextTick();

    // Update all listeners.
    this._removeListeners();
    this._listenerStates.forEach((ids, type) => {
      ids.forEach((state, id) => {
        if (state.listeners) {
          state.listeners.forEach(({ type: event, callback }) => {
            this._setupListener(type, id, event, callback);
          });
        }
      });
    });

    // Update all auto-highlight cuepoints.
    this._removeAutoHighlights();
    this._autoHighlights.forEach(({ id, from, to }) => {
      this._setupAutoHighlight(id, from, to);
    });
  }
}
