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
      return (type, id) => {
        const model = this.components?.[type]?.[id];
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
    isBlockToggled() {
      return (model) => {
        return this.toggledBlocks.includes(model.id);
      };
    },
    getChildrenProperty() {
      return (model) => {
        switch (model.type) {
          case "Block":
            return "pages";
          case "Page":
          case "Scenario":
            return "children";
        }

        return null;
      };
    },
    hasChildren() {
      return (model) => {
        const property = this.getChildrenProperty(model);
        switch (model.type) {
          case "Block":
            return model[property]?.length > 0;
          case "Page":
          case "Scenario":
            return model[property]?.length > 0;
        }

        return false;
      };
    },
    getChildren() {
      return (model) => {
        let children = [];

        if (this.hasChildren(model)) {
          const property = this.getChildrenProperty(model);
          children = model[property];
        }

        return children.map((c) => this.get(c.schema, c.id)).filter((m) => m);
      };
    },
    getParent() {
      return (model) => {
        if (model.parent) {
          return this.get(model.parent.schema, model.parent.id);
        }
        return null;
      };
    },
  },
  actions: {
    init(data) {
      const normalized = normalize(data);

      Object.entries(normalized.entities).forEach(([type, models]) => {
        this.components[type] = {};
        Object.entries(models).forEach(([id, model]) => {
          this.components[type][id] = new Models[type](model);
        });
      });

      this.scenarios = normalized.result;
      this.activeScenario = this.scenarios[0];
    },
    update(model, data) {
      model.update(data);
    },
    add(model, parent = null) {
      this.components[model.type] = this.components[model.type] || {};
      this.components[model.type][model.id] = model;

      switch (parent.type) {
        case "Block":
          parent.pages.push({ schema: model.type, id: model.id });
          break;

        default:
          parent.children.push({ schema: model.type, id: model.id });
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
