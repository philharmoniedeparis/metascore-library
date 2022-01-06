import { createStore as createVuexStore, createLogger } from "vuex";
import VuexORM from "@vuex-orm/core";

export function createStore({ debug = false } = {}) {
  const database = new VuexORM.Database();

  const plugins = [VuexORM.install(database)];

  if (debug) {
    plugins.push(createLogger());
  }

  const state = {
    selectedComponents: {},
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
    isComponentSelected: (state) => (model) => {
      return model.id in state.selectedComponents;
    },
  };

  const mutations = {
    selectComponent(state, { model }) {
      if (!getters.isComponentSelected(state)(model)) {
        state.selectedComponents[model.id] = model;
      }
    },
    deselectComponent(state, { model }) {
      delete state.selectedComponents[model.id];
    },
    deselectAllComponents(state) {
      state.selectedComponents = {};
    },
  };

  const actions = {};

  return createVuexStore({
    plugins,
    state,
    getters,
    mutations,
    actions,
  });
}
