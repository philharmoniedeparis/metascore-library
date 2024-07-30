import { useModule } from "@core/services/module-manager";
import { javascriptGenerator as JavaScript } from "blockly/javascript";
import { unref, watch, nextTick } from "vue";

let unwatchActiveScenario = null;
const listeners = new Set();
const autoHighlights = new Set();

export function init(context) {
  // Ensure 'Links' name does not conflict with variable names.
  JavaScript.addReservedWords("Links");

  const { activeScenario } = useModule("app_components");
  unwatchActiveScenario = watch(activeScenario, onScenarioChange);

  // Add 'Links' object to context.
  context.Links = {
    addEventListener: (id, type, callback) => {
      listeners.add({ id, type, callback });
      setupListener(id, type, callback);
    },
    openUrl: (url) => {
      window.open(url, "_blank");
    },
    autoHighlight: setupAutoHighlight,
  };
}

export function reset() {
  // Remove watcher.
  if (unwatchActiveScenario) {
    unwatchActiveScenario();
    unwatchActiveScenario = null;
  }

  // Remove all listeners.
  removeListeners();

  // Clear the list of listeners.
  listeners.clear();

  // Remove all autohighlight cuepoints.
  removeAutoHighlights();

  // Clear the list of auto highlights.
  autoHighlights.clear();
}

/**
 * Get link elements by trigger id.
 * @param {string} id The trigger id.
 * @returns {[HTMLElement]} The links
 */
function getLinks(id) {
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
function setupListener(id, type, callback) {
  /** @type [HTMLElement] */
  const links = getLinks(id);
  if (links.length === 0) return;

  // Add the event listener.
  links.forEach((link) => {
    link.addEventListener(type, callback);
  });
}

/**
 * Remove all listeners.
 */
function removeListeners() {
  listeners.forEach(({ id, type, callback }) => {
    /** @type [HTMLElement] */
    const links = getLinks(id);
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
function setupAutoHighlight(id, from, to) {
  /** @type [HTMLElement] */
  const links = getLinks(id);

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
  autoHighlights.add({ id, from, to, cuepoint });
}

/**
 * Remove all auto-highlighting.
 */
function removeAutoHighlights() {
  const { removeCuepoint } = useModule("media_cuepoints");
  autoHighlights.forEach(({ cuepoint }) => {
    removeCuepoint(cuepoint);
  });
}

/**
 * Watcher handler invoked when the scenario changes.
 */
async function onScenarioChange() {
  await nextTick();

  // Update all listeners.
  removeListeners();
  listeners.forEach(({ id, type, callback }) => {
    setupListener(id, type, callback);
  });

  // Update all auto-highlight cuepoints.
  removeAutoHighlights();
  autoHighlights.forEach(({ id, from, to }) => {
    setupAutoHighlight(id, from, to);
  });
}
