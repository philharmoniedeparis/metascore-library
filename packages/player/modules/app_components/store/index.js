import * as Components from "../models";
import { filter, cloneDeep } from "lodash";

function normalize(data) {
  let normalized = {};
  data.forEach((value) => {
    const relations = [];
    switch (value.type) {
      case "Scenario":
      case "Page":
        relations.push("children");
        break;

      case "Block":
        relations.push("pages");
        break;
    }

    relations.forEach((relation) => {
      if (value[relation]) {
        normalized = {
          ...normalized,
          ...normalize(value[relation]),
        };
        value[relation] = value[relation].map((related) => related.id);
      }
    });

    normalized[value.id] = new Components[value.type](value);
  });

  return normalized;
}

export default {
  namespaced: true,
  state: {
    components: {},
    activeScenario: null,
    toggledBlocks: [],
  },
  getters: {
    get: (state) => (id) => {
      const component = state.components[id];
      return component && !component.$deleted ? component : null;
    },
    create: () => (data) => {
      if (data.type in Components) {
        return new Components[data.type](data);
      }
    },
    filterByIds: (state) => (ids) => {
      return ids
        .map((id) => {
          return state.components[id];
        })
        .filter((component) => {
          return component && !component.$deleted;
        });
    },
    filterByType: (state) => (type) => {
      return filter(state.components, (component) => {
        return !component.$deleted && component.type === type;
      });
    },
    isBlockToggled: (state) => (id) => {
      return state.toggledBlocks.includes(id);
    },
  },
  mutations: {
    _set(state, data) {
      state.components = normalize(cloneDeep(data));
    },
    setActiveScenario(state, scenario) {
      state.activeScenario = scenario.id;
    },
    toggleBlock(state, id) {
      if (state.toggledBlocks.includes(id)) {
        state.toggledBlocks = state.toggledBlocks.filter((v) => v !== id);
      } else {
        state.toggledBlocks.push(id);
      }
    },
  },
  actions: {
    async set({ commit, getters }, data) {
      commit("_set", data);
      commit("setActiveScenario", getters.filterByType("Scenario")[0]);
    },
  },
};
