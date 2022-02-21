import { filter } from "lodash";
import { normalize } from "../utils/normalize";
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
      const component = state.components[id];
      return component && !component.$deleted ? component : null;
    },
    create: () => (data) => {
      if (data.type in Models) {
        return new Models[data.type](data);
      }
    },
    filterByType: (state) => (type) => {
      return filter(state.components, (component) => {
        return !component.$deleted && component.type === type;
      });
    },
    isBlockToggled: (state) => (id) => {
      return state.toggledBlocks.includes(id);
    },
    hasChildren: () => (component) => {
      switch (component.type) {
        case "Block":
          return component.pages?.length > 0;
        case "Page":
        case "Scenario":
          return component.children?.length > 0;
      }

      return false;
    },
    getChildren: (state, getters) => (component) => {
      let ids = [];

      if (getters.hasChildren(component)) {
        switch (component.type) {
          case "Block":
            ids = component.pages;
            break;

          case "Page":
          case "Scenario":
            ids = component.children;
        }
      }

      return ids;
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
    setActiveScenario(state, id) {
      state.activeScenario = id;
    },
    toggleBlock(state, id) {
      if (state.toggledBlocks.includes(id)) {
        state.toggledBlocks = state.toggledBlocks.filter((v) => v !== id);
      } else {
        state.toggledBlocks.push(id);
      }
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

      return ids;
    },
  },
};
