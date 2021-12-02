import { createStore as createVuexStore, createLogger } from "vuex";
import VuexORM from "@vuex-orm/core";
import createMediaModule from "./modules/media";
import createComponentsModule from "./modules/components";

export function createStore({ app, debug = false }) {
  const database = new VuexORM.Database();

  const plugins = [VuexORM.install(database)];

  if (debug) {
    plugins.push(createLogger());
  }

  return createVuexStore({
    plugins,
    modules: {
      media: createMediaModule({ app }),
      components: createComponentsModule({ database }),
    },
    state: {},
    mutations: {},
    actions: {},
  });
}
