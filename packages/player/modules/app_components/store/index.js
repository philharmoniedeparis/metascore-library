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
        let children = [];

        if (this.hasChildren(model)) {
          switch (model.type) {
            case "Block":
              children = model.pages;
              break;

            case "Page":
            case "Scenario":
              children = model.children;
          }
        }

        return children.map((c) => this.get(c.schema, c.id)).filter((m) => m);
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
          parent.pages.push({ id: model.id, schema: model.type });
          break;

        default:
          parent.children.push({ id: model.id, schema: model.type });
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
