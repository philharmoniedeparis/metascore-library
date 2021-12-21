import { createStore as createVuexStore, createLogger } from "vuex";
import VuexORM from "@vuex-orm/core";
import { createVuexSync } from "../../core/plugins/vuex-sync";
import createDeviceModule from "./modules/device";
import createMediaModule from "../../core/store/modules/media";
import createComponentsModule from "../../core/store/modules/components";
import BackendApi from "../api/backend";

export function createStore({ debug = false } = {}) {
  const api = new BackendApi();
  const database = new VuexORM.Database();
  const vuexSync = createVuexSync({
    channelName: "metascore-editor-sync",
    filterOutgoing(mutation) {
      return /setReady|entities\/|components\//.test(mutation.type);
    },
  });

  const plugins = [VuexORM.install(database), vuexSync];

  if (debug) {
    plugins.push(createLogger());
  }

  return createVuexStore({
    plugins,
    modules: {
      device: createDeviceModule(),
      media: createMediaModule(),
      components: createComponentsModule({ database }),
    },
    state: {
      ready: false,
      css: null,
    },
    mutations: {
      setReady(state, ready) {
        state.ready = ready;
      },
      setCss(state, css) {
        state.css = css;
      },
    },
    actions: {
      async load({ commit, dispatch }, url) {
        commit("setReady", false);

        const data = await api.load(url);

        commit("media/setSources", [
          {
            src: data.media.url,
            type: data.media.mime,
          },
        ]);

        dispatch("components/load", data.components);

        commit("setCss", data.css);

        commit("setReady", true);
      },
    },
  });
}
