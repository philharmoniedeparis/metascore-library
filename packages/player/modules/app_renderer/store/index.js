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
  actions: {},
};
