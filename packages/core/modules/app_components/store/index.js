import { defineStore } from "pinia";
import { readonly } from "vue";
import { v4 as uuid } from "uuid";
import { normalize } from "./utils/normalize";
import * as Models from "../models";

export default defineStore("app-components", {
  state: () => {
    return {
      components: {},
      activeScenario: null,
      toggled: [],
    };
  },
  getters: {
    get() {
      return (type, id) => {
        const data = this.components?.[type]?.[id];
        return data && !data.$deleted ? readonly(data) : null;
      };
    },
    getByType() {
      return (type) => {
        return Object.keys(this.components?.[type] || {})
          .map((id) => this.get(type, id))
          .filter((c) => c);
      };
    },
    getModel() {
      return (type) => {
        return Models[type];
      };
    },
    isToggled() {
      return (component) => {
        return this.toggled.some(({ type, id }) => {
          return component.type === type && component.id === id;
        });
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
    getSiblings() {
      return (component) => {
        const parent = this.getParent(component);
        if (parent) {
          return this.getChildren(parent).filter((c) => {
            return !(c.type === component.type && c.id === component.id);
          });
        }
        return [];
      };
    },
  },
  actions: {
    init(data) {
      const normalized = normalize(data);
      this.components = normalized.entities;
      this.activeScenario = normalized.result[0].id;
    },
    create(data, validate = true) {
      if (data.type in Models) {
        if (!("id" in data)) {
          switch (data.type) {
            case "Scenario":
              {
                // Generate a user-freindly ID.
                const next_id = this.getByType("Scenario").reduce((acc, s) => {
                  const id = parseInt(s.id.replace("scenario-", ""), 10);
                  return !isNaN(id) ? Math.max(acc, id + 1) : acc;
                }, 1);
                data.id = `scenario-${next_id}`;
              }
              break;

            default:
              data.id = `component-${uuid()}`;
          }
        }

        return validate ? new Models[data.type](data) : data;
      }
    },
    add(component, parent = null) {
      this.components[component.type] = this.components[component.type] || {};
      this.components[component.type][component.id] = component;

      if (parent) {
        this.update(component, {
          $parent: {
            schema: parent.type,
            id: parent.id,
          },
        });

        const children_prop = this.getChildrenProperty(parent);
        this.update(parent, {
          [children_prop]: [
            ...parent[children_prop],
            {
              schema: component.type,
              id: component.id,
            },
          ],
        });
      }

      switch (component.type) {
        case "Block":
          {
            if (component.pages.length < 1) {
              this.add(this.create({ type: "Page" }), component);
            }
          }
          break;
      }
    },
    update(component, data) {
      const updated = {
        ...component,
        ...data,
      };
      const model = this.getModel(component.type);
      if (model.validate(updated)) {
        this.components[component.type][component.id] = updated;

        if (model.type === "Page") {
          if ("start-time" in data || "end-time" in data) {
            const block = this.getParent(component);
            if (block.synched) {
              const pages = this.getChildren(block);
              const index = pages.findIndex((c) => c.id === component.id);

              if ("start-time" in data && index > 0) {
                pages[index - 1]["end-time"] = data["start-time"];
              }
              if ("end-time" in data && index < pages.length - 1) {
                pages[index + 1]["start-time"] = data["end-time"];
              }
            }
          }
        }
      } else {
        // @todo: handle errors.
        console.error(model.errors);
      }
    },
    delete(type, id) {
      const component = this.components?.[type]?.[id];
      if (component) {
        component.$deleted = true;
      }
    },
    restore(type, id) {
      const component = this.components?.[type]?.[id];
      if (component) {
        delete component.$deleted;
      }
    },
    toggle(component) {
      const { type, id } = component;
      if (this.isToggled(component)) {
        this.toggled = this.toggled.filter(
          (t) => t.type === type && t.id === id
        );
      } else {
        this.toggled.push({ type, id });
      }
    },
  },
});
