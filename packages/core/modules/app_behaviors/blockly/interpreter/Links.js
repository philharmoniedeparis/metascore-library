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
    this._listeners = new Set();
    this._autoHighlights = new Set();
  }

  get context() {
    const { activeScenario } = useModule("app_components");
    this._unwatchActiveScenario = watch(
      activeScenario,
      this._onScenarioChange.bind(this)
    );

    return {
      Links: {
        addEventListener: (id, type, callback) => {
          this._listeners.add({ id, type, callback });
          this._setupListener(id, type, callback);
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

    // Clear the list of this._listeners.
    this._listeners.clear();

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
    let { el: root } = useModule("app_renderer");
    root = unref(root);

    return root.querySelectorAll(
      `.metaScore-component.content .contents a[data-behavior-trigger="${id}"]`
    );
  }

  /**
   * Setup a listener on links with a given behavior-trigger id.
   * @param {string} id The behavior-trigger id
   * @param {string} type The event type to add the listener on.
   * @param {function} callback The callback that will be invoked when an event is dispatched.
   */
  _setupListener(id, type, callback) {
    /** @type [HTMLElement] */
    const links = this._getLinks(id);
    if (links.length === 0) return;

    // Add the event listener.
    links.forEach((link) => {
      link.addEventListener(type, callback);
    });
  }

  /**
   * Remove all this._listeners.
   */
  _removeListeners() {
    this._listeners.forEach(({ id, type, callback }) => {
      /** @type [HTMLElement] */
      const links = this._getLinks(id);
      links.forEach((link) => {
        link.removeEventListener(type, callback);
      });
    });
  }

  /**
   * Setup auto-highlighting on links with a given behavior-trigger id.
   * @param {string} id The behavior-trigger id
   * @param {number} from The start-time in seconds at which the link should be highlighted.
   * @param {number} to The end-time in seconds at which the link should be highlighted.
   */
  _setupAutoHighlight(id, from, to) {
    /** @type [HTMLElement] */
    const links = this._getLinks(id);

    if (links.length === 0) return;

    let { linksAutoHighlightClass } = useModule("app_components");
    const { addCuepoint } = useModule("media_cuepoints");

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
    const { removeCuepoint } = useModule("media_cuepoints");
    this._autoHighlights.forEach(({ cuepoint }) => {
      removeCuepoint(cuepoint);
    });
  }

  /**
   * Watcher handler invoked when the scenario changes.
   */
  async _onScenarioChange() {
    await nextTick();

    // Update all this._listeners.
    this._removeListeners();
    this._listeners.forEach(({ id, type, callback }) => {
      this._setupListener(id, type, callback);
    });

    // Update all auto-highlight cuepoints.
    this._removeAutoHighlights();
    this._autoHighlights.forEach(({ id, from, to }) => {
      this._setupAutoHighlight(id, from, to);
    });
  }
}
