import { useModule } from "@metascore-library/core/services/module-manager";
import { javascriptGenerator as JavaScript } from "blockly/javascript";
import { unref } from "vue";

const listeners = [];
const cuepoints = [];

/**
 * Get a link element by id.
 * @param {string} id The links's id.
 * @returns {HTMLElement?} The link
 */
function getLink(id) {
  let { el: root } = useModule("app_renderer");
  root = unref(root);

  return root.querySelector(
    `.metaScore-component.content .contents a[data-behavior-trigger="${id}"]`
  );
}

export function init(context) {
  // Ensure 'Links' name does not conflict with variable names.
  JavaScript.addReservedWords("Links");

  // Add 'Links' object to context.
  context.Links = {
    addEventListener: (id, type, callback) => {
      /** @type HTMLElement */
      const el = getLink(id);

      if (!el) return;

      // Add the event listener.
      el.addEventListener(type, callback);

      // Add to list of listeners.
      listeners.push({
        el,
        type,
        callback,
      });
    },
    openUrl: (url) => {
      window.open(url, "_blank");
    },
    autoHighlight: (id, from, to) => {
      /** @type HTMLElement */
      const el = getLink(id);

      if (!el) return;

      let { linksAutoHighlightClass } = useModule("app_components");
      const { addCuepoint } = useModule("media_cuepoints");

      const cuepoint = addCuepoint({
        startTime: from,
        endTime: to,
        onStart: () => {
          el.classList.add(linksAutoHighlightClass);
        },
        onStop: () => {
          el.classList.remove(linksAutoHighlightClass);
        },
        onDestroy: () => {
          el.classList.remove(linksAutoHighlightClass);
        },
      });
      cuepoints.push(cuepoint);
    },
  };
}

export function reset() {
  // Remove all listeners.
  while (listeners.length > 0) {
    const { el, type, callback } = listeners.pop();
    el.removeEventListener(type, callback);
  }

  // Remove all cuepoints.
  const { removeCuepoint } = useModule("media_cuepoints");
  while (cuepoints.length > 0) {
    const cuepoint = cuepoints.pop();
    removeCuepoint(cuepoint);
  }
}
