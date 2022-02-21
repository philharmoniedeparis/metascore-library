export default {
  namespaced: true,
  state: {
    items: [],
  },
  mutations: {
    init(state, data) {
      state.items = data;
    },
    addItem(state, item) {
      state.items.push(item);
    },
  },
};
