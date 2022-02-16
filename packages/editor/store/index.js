import { createStore as createVuexStore, createLogger } from "vuex";

export function createStore({ debug = false } = {}) {
  const plugins = [];

  if (debug) {
    plugins.push(createLogger());
  }

  const state = {
    selectedComponents: new Set(),
    lockedComponents: new Set(),
  };

  const getters = {
    isComponentSelected: (state) => (id) => {
      return state.selectedComponents.has(id);
    },
    getSelectedComponents: (state, getters, rootState, rootGetters) => {
      return rootGetters["app-components/filterByIds"](
        Array.from(state.selectedComponents)
      );
    },
    isComponentLocked: (state) => (id) => {
      return state.lockedComponents.has(id);
    },
    getLockedComponents: (state, getters, rootState, rootGetters) => {
      return rootGetters["app-components/filterByIds"](
        Array.from(state.lockedComponents)
      );
    },
  };

  const mutations = {
    selectComponent(state, id) {
      state.selectedComponents.add(id);
    },
    deselectComponent(state, id) {
      state.selectedComponents.delete(id);
    },
    deselectAllComponents(state) {
      state.selectedComponents.clear();
    },
    lockComponent(state, id) {
      state.lockedComponents.add(id);
    },
    unlockComponent(state, id) {
      state.lockedComponents.delete(id);
    },
  };

  const actions = {
    updateComponent(context, { model, data }) {
      model.update(data);
    },
    updateComponents({ dispatch }, { models, data }) {
      models.forEach((model) => {
        dispatch("updateComponent", { model, data });
      });
    },
    addComponent({ getters, commit }, { data, parent }) {
      const model = getters["app-components/create"](data);
      commit("app-components/add", { model, parent });
      commit("selectComponent", model.id);
    },
  };

  return createVuexStore({
    plugins,
    state,
    getters,
    mutations,
    actions,
  });
}
