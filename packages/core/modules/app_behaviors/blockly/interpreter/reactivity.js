import { javascriptGenerator as JavaScript } from "blockly/javascript";
import { watchEffect, ref, unref, isRef } from "vue";

const watchers = [];

export function init(context) {
  // Ensure 'Reactivity' name does not conflict with variable names.
  JavaScript.addReservedWords("Reactivity");

  // Add 'Reactivity' object to context.
  context.Reactivity = {
    ref,
    unref,
    isRef,
    watchEffect: (fn) => {
      const unwatch = watchEffect(fn, {
        flush: "post",
      });
      watchers.push(unwatch);
    },
  };
}

export function reset() {
  // Remove all watchers.
  while (watchers.length > 0) {
    const unwatch = watchers.pop();
    unwatch();
  }
}
