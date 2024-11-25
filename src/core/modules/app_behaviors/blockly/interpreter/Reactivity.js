import { javascriptGenerator as JavaScript } from "blockly/javascript";
import { watchEffect, ref, unref, isRef } from "vue";
import AbstractInterpreter from "./AbstractInterpreter";

export default class Reactivity extends AbstractInterpreter {
  constructor() {
    super();

    // Ensure context name does not conflict with variable names.
    JavaScript.addReservedWords("Reactivity");

    this._watchers = [];
  }

  get context() {
    return {
      Reactivity: {
        ref,
        unref,
        isRef,
        watchEffect: (fn) => {
          const unwatch = watchEffect(fn, {
            flush: "post",
          });
          this._watchers.push(unwatch);
        },
      },
    };
  }

  reset() {
    // Remove all watchers.
    while (this._watchers.length > 0) {
      const unwatch = this._watchers.pop();
      unwatch();
    }
  }
}
