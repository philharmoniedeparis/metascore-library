import { cloneDeep } from "lodash";

const initalState = {
  isShown: false,
  items: [],
  target: null,
  position: {
    x: 0,
    y: 0,
  },
};

export default {
  namespaced: true,
  state: cloneDeep(initalState),
  mutations: {
    show(state, { x, y, target }) {
      state.isShown = true;
      state.target = target;
      state.position = { x, y };
    },
    hide(state) {
      Object.assign(state, cloneDeep(initalState));
    },
    addItem(state, item) {
      state.items.push(item);
    },
  },
};
