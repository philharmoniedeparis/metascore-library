import { createStore as createVuexStore, createLogger } from "vuex";
import VuexORM from "@vuex-orm/core";
import createDeviceModule from "./modules/device";
import BackendApi from "../api/backend";

export function createStore({ debug = false } = {}) {
  const api = new BackendApi();
  const database = new VuexORM.Database();

  const plugins = [VuexORM.install(database)];

  if (debug) {
    plugins.push(createLogger());
  }

  return createVuexStore({
    plugins,
    modules: {
      device: createDeviceModule(),
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
