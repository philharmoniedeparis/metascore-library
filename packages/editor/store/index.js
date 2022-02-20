import { createStore as createVuexStore, createLogger } from "vuex";
import BackendApi from "../../api/backend";

const api = new BackendApi();

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
    isComponentSelected: (state) => (model) => {
      return state.selectedComponents.has(model.id);
    },
    getSelectedComponents: (state, getters, rootState, rootGetters) => {
      return Array.from(state.selectedComponents).map(
        rootGetters["app-components/get"]
      );
    },
    componentHasSelectedDescendents:
      (state, getters, rootState, rootGetters) => (model) => {
        const children = rootGetters["app-components/getChildren"](model);
        return children.some((child) => {
          if (getters.isComponentSelected(child)) {
            return true;
          }

          return getters.componentHasSelectedDescendents(child);
        });
      },
    isComponentLocked: (state) => (model) => {
      return state.lockedComponents.has(model.id);
    },
    getLockedComponents: (state, getters, rootState, rootGetters) => {
      return Array.from(state.lockedComponents).map(
        rootGetters["app-components/get"]
      );
    },
  };

  const mutations = {
    selectComponent(state, model) {
      state.selectedComponents.add(model.id);
    },
    deselectComponent(state, model) {
      state.selectedComponents.delete(model.id);
    },
    deselectAllComponents(state) {
      state.selectedComponents.clear();
    },
    lockComponent(state, model) {
      state.lockedComponents.add(model.id);
    },
    unlockComponent(state, model) {
      state.lockedComponents.delete(model.id);
    },
  };

  const actions = {
    async load({ commit, dispatch }, url) {
      const data = await api.load(url);

      commit("media/setSource", data.media, { root: true });

      dispatch("app-components/set", data.components, { root: true });

      commit("app-renderer/setWidth", data.width);
      commit("app-renderer/setHeight", data.height);
      commit("app-renderer/setCss", data.css);
      commit("app-renderer/setReady", true);
    },
    updateComponent({ commit }, { model, data }) {
      commit("app-components/update", { model, data });
    },
    updateComponents({ commit }, { models, data }) {
      models.forEach((model) => {
        commit("app-components/update", { model, data });
      });
    },
    addComponent({ getters, commit }, { data, parent }) {
      const model = getters["app-components/create"](data);
      commit("app-components/add", { model, parent });
      return model;
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
