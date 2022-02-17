import { cloneDeep } from "lodash";

const initalState = {
  isShown: false,
  items: [],
  position: {
    x: 0,
    y: 0,
  },
  target: null,
};

export default {
  namespaced: true,
  state: cloneDeep(initalState),
  mutations: {
    show(state, { x, y, target }) {
      state.position = { x, y };
      state.target = target;
      state.isShown = true;
    },
    hide(state) {
      Object.assign(state, cloneDeep(initalState));
    },
    addItem(state, item) {
      state.items.push(item);
    },
  },
};
