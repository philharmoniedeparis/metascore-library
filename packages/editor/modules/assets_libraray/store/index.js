import { normalize } from "./utils/normalize";

export default {
  namespaced: true,
  state: {
    list: [],
    items: {},
  },
  getters: {
    get: (state) => (id) => {
      const item = state.items[id];
      return item && !item.$deleted ? item : null;
    },
    getAll: (state) => {
      return state.list
        .map((id) => {
          const item = state.items[id];
          return item && !item.$deleted ? item : null;
        })
        .filter((i) => i);
    },
    getName: () => (item) => {
      return item.name;
    },
    getFile: () => (item) => {
      return item.shared ? item.file : item;
    },
    getType: () => (item) => {
      if (item.type) {
        return item.type;
      }

      const file = item.shared ? item.file : item;
      const matches = /^(image|audio|video)\/.*/.exec(file.mimetype);
      return matches ? matches[1] : null;
    },
  },
  mutations: {
    init(state, data) {
      const normalized = normalize(data);
      state.items = normalized.entities.assets;
      state.list = normalized.result;
    },
    add(state, item) {
      state.items.push(item);
    },
    delete(state, id) {
      const item = state.items[id];
      if (item) {
        item.$deleted = true;
      }
    },
  },
};
