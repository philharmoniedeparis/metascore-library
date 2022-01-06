import { createStore as createVuexStore, createLogger } from "vuex";
import VuexORM from "@vuex-orm/core";

export function createStore({ debug = false } = {}) {
  const database = new VuexORM.Database();

  const plugins = [VuexORM.install(database)];

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
