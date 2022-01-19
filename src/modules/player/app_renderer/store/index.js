import BackendApi from "../../../../api/backend";

const api = new BackendApi();

export default {
  namespaced: true,
  state: {
    ready: false,
    width: null,
    height: null,
    css: null,
  },
  mutations: {
    setReady(state, ready) {
      state.ready = ready;
    },
    setWidth(state, value) {
      state.width = value;
    },
    setHeight(state, value) {
      state.height = value;
    },
    setCss(state, value) {
      state.css = value;
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

      dispatch("app-components/clear", null, { root: true });
      dispatch("app-components/insert", data.components, { root: true });

      commit("setWidth", data.width);
      commit("setHeight", data.height);
      commit("setCss", data.css);

      commit("setReady", true);
    },
  },
};
