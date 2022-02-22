import { filter } from "lodash";
import { normalize } from "./utils/normalize";
import * as Models from "../models";

export default {
  namespaced: true,
  state: {
    components: {},
    scenarios: [],
    activeScenario: null,
    toggledBlocks: [],
  },
  getters: {
    get: (state) => (id) => {
      const model = state.components[id];
      return model && !model.$deleted ? model : null;
    },
    create: () => (data) => {
      if (data.type in Models) {
        return new Models[data.type](data);
      }
    },
    filterByType: (state) => (type) => {
      return filter(state.components, (model) => {
        return !model.$deleted && model.type === type;
      });
    },
    isBlockToggled: (state) => (model) => {
      return state.toggledBlocks.includes(model.id);
    },
    hasChildren: () => (model) => {
      switch (model.type) {
        case "Block":
          return model.pages?.length > 0;
        case "Page":
        case "Scenario":
          return model.children?.length > 0;
      }

      return false;
    },
    getChildren: (state, getters) => (model) => {
      let ids = [];

      if (getters.hasChildren(model)) {
        switch (model.type) {
          case "Block":
            ids = model.pages;
            break;

          case "Page":
          case "Scenario":
            ids = model.children;
        }
      }

      return ids.map(getters.get);
    },
  },
  mutations: {
    init(state, data) {
      const normalized = normalize(data);

      Object.entries(normalized.entities.components).forEach(
        ([key, values]) => {
          state.components[key] = new Models[values.type](values);
        }
      );

      state.scenarios = normalized.result;
      state.activeScenario = state.scenarios[0];
    },
    update(state, { model, data }) {
      model.update(data);
    },
    add(state, { model, parent }) {
      state.components[model.id] = model;

      switch (parent.type) {
        case "Block":
          parent.pages.push(model.id);
          break;

        default:
          parent.children.push(model.id);
      }
    },
    setActiveScenario(state, model) {
      state.activeScenario = model.id;
    },
    toggleBlock(state, model) {
      if (state.toggledBlocks.includes(model.id)) {
        state.toggledBlocks = state.toggledBlocks.filter((v) => v !== model.id);
      } else {
        state.toggledBlocks.push(model.id);
      }
    },
  },
};
