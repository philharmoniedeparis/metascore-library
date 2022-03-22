import { defineStore } from "pinia";
import { normalize } from "./utils/normalize";
import * as Models from "../models";

export default defineStore("app-components", {
  state: () => {
    return {
      components: {},
      scenarios: [],
      activeScenario: null,
      toggledBlocks: [],
    };
  },
  getters: {
    create() {
      return (data) => {
        if (data.type in Models) {
          return new Models[data.type](data);
        }
      };
    },
    get() {
      return (type, id) => {
        const data = this.components?.[type]?.[id];
        return data && !data.$deleted ? data : null;
      };
    },
    getModel() {
      return (type) => {
        return Models[type];
      };
    },
    delete() {
      return (type, id) => {
        const component = this.components?.[type]?.[id];
        if (component) {
          component.$deleted = true;
        }
      };
    },
    restore() {
      return (type, id) => {
        const component = this.components?.[type]?.[id];
        if (component) {
          delete component.$deleted;
        }
      };
    },
    isBlockToggled() {
      return (block) => {
        return this.toggledBlocks.includes(block.id);
      };
    },
    getChildrenProperty() {
      return (component) => {
        switch (component.type) {
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
      return (component) => {
        const property = this.getChildrenProperty(component);
        switch (component.type) {
          case "Block":
            return component[property]?.length > 0;
          case "Page":
          case "Scenario":
            return component[property]?.length > 0;
        }

        return false;
      };
    },
    getChildren() {
      return (component) => {
        let children = [];

        if (this.hasChildren(component)) {
          const property = this.getChildrenProperty(component);
          children = component[property];
        }

        return children.map((c) => this.get(c.schema, c.id)).filter((m) => m);
      };
    },
    getParent() {
      return (component) => {
        if (component.$parent) {
          return this.get(component.$parent.schema, component.$parent.id);
        }
        return null;
      };
    },
  },
  actions: {
    init(data) {
      const normalized = normalize(data);
      this.components = normalized.entities;
      this.scenarios = normalized.result;
      this.activeScenario = this.scenarios[0];
    },
    add(data, parent) {
      this.components[data.type] = this.components[data.type] || {};
      this.components[data.type][data.id] = {
        ...data,
        $parent: {
          schema: parent.type,
          id: parent.id,
        },
      };

      switch (parent.type) {
        case "Block":
          parent.pages.push({ schema: data.type, id: data.id });
          break;

        default:
          parent.children.push({ schema: data.type, id: data.id });
      }
    },
    update(component, data) {
      const merged = {
        ...component,
        ...data,
      };
      const model = this.getModel(component.type);
      if (model.validate(merged)) {
        this.components[component.type][component.id] = merged;
      }
    },
    toggleBlock(block) {
      if (this.toggledBlocks.includes(block.id)) {
        this.toggledBlocks = this.toggledBlocks.filter((v) => v !== block.id);
      } else {
        this.toggledBlocks.push(block.id);
      }
    },
  },
});
