import { defineStore } from "pinia";
import { readonly } from "vue";
import { v4 as uuid } from "uuid";
import { normalize, denormalize } from "./utils/normalize";
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
        const component = this.components?.[type]?.[id];
        return component && !component.$deleted
          ? readonly(component.data)
          : null;
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

        return children.map((c) => this.get(c.type, c.id)).filter((m) => m);
      };
    },
    getParent() {
      return (component) => {
        const parent =
          this.components?.[component.type]?.[component.id]?.$parent;
        if (parent) {
          return this.get(parent.type, parent.id);
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
    toJson() {
      return () => {
        const input = this.getByType("Scenario").map((scenario) => {
          return { id: scenario.id, type: "Scenario" };
        });
        return denormalize(input, this.components);
      };
    },
  },
  actions: {
    async init(data) {
      const normalized = await normalize(data);
      this.components = normalized.entities;
      this.activeScenario = normalized.result[0].id;
    },
    async create(data, validate = true) {
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

        return await Models[data.type].create(data, validate);
      }
    },
    async add(component, parent = null) {
      this.components[component.type] = this.components[component.type] || {};
      this.components[component.type][component.id] = component;

      if (parent) {
        component.$parent = {
          type: parent.type,
          id: parent.id,
        };

        const children_prop = this.getChildrenProperty(parent);
        await this.update(parent, {
          [children_prop]: [
            ...parent[children_prop],
            {
              type: component.type,
              id: component.id,
            },
          ],
        });
      }

      switch (component.type) {
        case "Block":
          {
            if (component.pages.length < 1) {
              const page = await this.create({ type: "Page" });
              await this.add(page, component);
            }
          }
          break;
      }

      return component;
    },
    async update(component, data) {
      try {
        await this.components[component.type][component.id].update(data);

        if (component.type === "Page") {
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
      } catch (e) {
        // @todo: handle errors.
        console.error(e);
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
