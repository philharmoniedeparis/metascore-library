import { createStore as createVuexStore, createLogger } from "vuex";
import VuexORM from "@vuex-orm/core";
import createMediaModule from "@/player/store/modules/media";
import createComponentsModule from "@/player/store/modules/components";

export function createStore({ debug = false }) {
  const database = new VuexORM.Database();

  const plugins = [VuexORM.install(database)];

  if (debug) {
    plugins.push(createLogger());
  }

  return createVuexStore({
    plugins,
    modules: {
      media: createMediaModule(),
      components: createComponentsModule({ database }),
    },
    state: {},
    mutations: {},
    actions: {},
  });
}
