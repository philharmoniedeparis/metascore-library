import BackendApi from "../../../../api/backend";

const api = new BackendApi();

export default {
  namespaced: true,
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

      commit(
        "media/setSources",
        [
          {
            src: data.media.url,
            type: data.media.mime,
          },
        ],
        { root: true }
      );

      dispatch("components/load", data.components, { root: true });

      commit("setCss", data.css);

      commit("setReady", true);
    },
  },
};
