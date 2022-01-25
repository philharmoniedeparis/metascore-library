import { createStore as createVuexStore, createLogger } from "vuex";

export function createStore({ debug = false } = {}) {
  const plugins = [];

  if (debug) {
    plugins.push(createLogger());
  }

  const state = {
    selectedComponents: new Set(),
  };

  const getters = {
    isComponentSelected: (state) => (model) => {
      return state.selectedComponents.has(model.id);
    },
    getSelectedComponents: (state, getters, rootState, rootGetters) => {
      return rootGetters["app-components/filterByIds"](
        Array.from(state.selectedComponents)
      );
    },
  };

  const mutations = {
    selectComponent(state, { model }) {
      if (!getters.isComponentSelected(state)(model)) {
        state.selectedComponents.add(model.id);
      }
    },
    deselectComponent(state, { model }) {
      state.selectedComponents.delete(model.id);
    },
    deselectAllComponents(state) {
      state.selectedComponents.clear();
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
  };

  return createVuexStore({
    plugins,
    state,
    getters,
    mutations,
    actions,
  });
}
