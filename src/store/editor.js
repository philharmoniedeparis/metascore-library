import { createStore as createVuexStore, createLogger } from "vuex";
import VuexORM from "@vuex-orm/core";

export function createStore({ debug = false } = {}) {
  const database = new VuexORM.Database();

  const plugins = [VuexORM.install(database)];

  if (debug) {
    plugins.push(createLogger());
  }

  const state = {
    selectedComponents: new Set(),
  };

  const getters = {
    getComponentById: () => (id) => {
      return (
        database
          .model("AbstractComponent")
          .query()
          .whereId(id)
          .withAllRecursive()
          .first() ||
        database
          .model("EmbeddableComponent")
          .query()
          .whereId(id)
          .withAllRecursive()
          .first()
      );
    },
    getComponentsByIds: (state, getters) => (ids) => {
      return ids.map(getters.getComponentById);
    },
    isComponentSelected: (state) => (model) => {
      return state.selectedComponents.has(model.id);
    },
    getSelectedComponents: (state, getters) => {
      return getters.getComponentsByIds(Array.from(state.selectedComponents));
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
      model.$dispatch("update", {
        ...data,
        id: model.id,
      });
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
