import { watchEffect, ref, unref, isRef } from "vue";
import AbstractInterpreter from "./AbstractInterpreter";

export default class Reactivity extends AbstractInterpreter {
  constructor() {
    super();

    this._watchers = [];
  }

  getContext() {
    return {
      ref,
      unref,
      isRef,
      watchEffect: (fn) => {
        const unwatch = watchEffect(fn, {
          flush: "post",
        });
        this._watchers.push(unwatch);
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
