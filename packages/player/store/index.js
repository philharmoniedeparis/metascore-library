import { createStore as createVuexStore, createLogger } from "vuex";
import BackendApi from "../../api/backend";

const api = new BackendApi();

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
    actions: {
      async load({ commit, dispatch }, url) {
        const data = await api.load(url);

        commit("media/setSource", data.media, { root: true });

        dispatch("app-components/set", data.components, { root: true });

        commit("app-renderer/setWidth", data.width);
        commit("app-renderer/setHeight", data.height);
        commit("app-renderer/setCss", data.css);
        commit("app-renderer/setReady", true);
      },
    },
  });
}
