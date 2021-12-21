import { createStore as createVuexStore, createLogger } from "vuex";
import VuexORM from "@vuex-orm/core";
import { createVuexSync } from "../../core/plugins/vuex-sync";
import createMediaModule from "../../core/store/modules/media";
import createComponentsModule from "../../core/store/modules/components";

export function createStore({ debug = false }) {
  const database = new VuexORM.Database();
  const vuexSync = createVuexSync({
    channelName: "metascore-editor-sync",
    filterOutgoing(mutation) {
      return /entities\/|components\//.test(mutation.type);
    },
  });

  const plugins = [VuexORM.install(database), vuexSync];

  if (debug) {
    plugins.push(createLogger());
  }

  return createVuexStore({
    plugins,
    modules: {
      media: createMediaModule(),
      components: createComponentsModule({ database }),
    },
    state: {
      playerReady: false,
    },
    mutations: {},
    actions: {},
  });
}
