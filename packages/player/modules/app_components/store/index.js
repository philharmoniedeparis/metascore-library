import { filter } from "lodash";
import { normalize } from "./utils/normalize";
import * as Models from "../models";

export default {
  state: () => {
    return {
      components: {},
      scenarios: [],
      activeScenario: null,
      toggledBlocks: [],
    };
  },
  getters: {
    get() {
      return (id) => {
        const model = this.components[id];
        return model && !model.$deleted ? model : null;
      };
    },
    create() {
      return (data) => {
        if (data.type in Models) {
          return new Models[data.type](data);
        }
      };
    },
    filterByType() {
      return (type) => {
        return filter(this.components, (model) => {
          return !model.$deleted && model.type === type;
        });
      };
    },
    isBlockToggled() {
      return (model) => {
        return this.toggledBlocks.includes(model.id);
      };
    },
    hasChildren() {
      return (model) => {
        switch (model.type) {
          case "Block":
            return model.pages?.length > 0;
          case "Page":
          case "Scenario":
            return model.children?.length > 0;
        }

        return false;
      };
    },
    getChildren() {
      return (model) => {
        let ids = [];

        if (this.hasChildren(model)) {
          switch (model.type) {
            case "Block":
              ids = model.pages;
              break;

            case "Page":
            case "Scenario":
              ids = model.children;
          }
        }

        return ids.map(this.get);
      };
    },
  },
  actions: {
    init(data) {
      const normalized = normalize(data);

      Object.entries(normalized.entities.components).forEach(
        ([key, values]) => {
          this.components[key] = new Models[values.type](values);
        }
      );

      this.scenarios = normalized.result;
      this.activeScenario = this.scenarios[0];
    },
    update(model, data) {
      model.update(data);
    },
    add(model, parent = null) {
      this.components[model.id] = model;

      switch (parent.type) {
        case "Block":
          parent.pages.push(model.id);
          break;

        default:
          parent.children.push(model.id);
      }
    },
    toggleBlock(model) {
      if (this.toggledBlocks.includes(model.id)) {
        this.toggledBlocks = this.toggledBlocks.filter((v) => v !== model.id);
      } else {
        this.toggledBlocks.push(model.id);
      }
    },
  },
};
