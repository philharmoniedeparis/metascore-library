import { createStore as createVuexStore, createLogger } from "vuex";

export function createStore({ debug = false } = {}) {
  const plugins = [];

  if (debug) {
    plugins.push(createLogger());
  }

  return createVuexStore({
    plugins,
    modules: {},
    state: {},
    mutations: {},
    actions: {},
  });
}
