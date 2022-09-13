import { defineStore } from "pinia";
import { readonly, unref } from "vue";
import { v4 as uuid } from "uuid";
import { omit, cloneDeep } from "lodash";
import { normalize, denormalize } from "./utils/normalize";
import { useModule } from "@metascore-library/core/services/module-manager";
import * as Models from "../models";

export default defineStore("app-components", {
  state: () => {
    return {
      components: {},
      activeScenario: null,
      blocksActivePage: {},
      toggled: [],
    };
  },
  getters: {
    getByType() {
      return (type) => {
        return Object.keys(this.components?.[type] || {})
          .map((id) => this.get(type, id))
          .filter((c) => c);
      };
    },
    find() {
      return (callback) => {
        const findMatch = (components) => {
          let match = null;
          components.some((c) => {
            if (callback(c)) {
              match = c;
              return true;
            }
            match = findMatch(this.getChildren(c));
            if (match) {
              return true;
            }
          });
          return match;
        };

        return findMatch(this.getByType("Scenario"));
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

        return children.map((c) => this.get(c.type, c.id)).filter((c) => c);
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
    get(type, id) {
      const component = this.components?.[type]?.[id];
      const data = component && !component.$deleted ? component.data : null;
      return readonly(data);
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

        let children = parent[children_prop] || [];
        children = children.concat([
          {
            type: component.type,
            id: component.id,
          },
        ]);

        await this.update(parent, {
          [children_prop]: children,
        });
      }

      return component;
    },
    async update(component, data) {
      try {
        if ("start-time" in data || "end-time" in data) {
          const { duration: mediaDuration } = useModule("media_player");
          const parent = this.getParent(component);
          if (parent && this.getModel(parent.type).$isTimeable) {
            if ("start-time" in data) {
              data["start-time"] = Math.max(
                data["start-time"],
                parent["start-time"] ?? 0
              );
            }
            if ("end-time" in data) {
              data["end-time"] = Math.min(
                data["end-time"],
                parent["end-time"] ?? unref(mediaDuration)
              );
            }
          }
        }

        await this.components[component.type][component.id].update(data);

        if (component.type === "Page") {
          if ("start-time" in data || "end-time" in data) {
            const block = this.getParent(component);
            if (block.synched) {
              const pages = this.getChildren(block);
              const index = pages.findIndex((c) => c.id === component.id);

              if ("start-time" in data && index > 0) {
                const prev_page = pages[index - 1];
                await this.components[prev_page.type][prev_page.id].update({
                  "end-time": data["start-time"],
                });
              }
              if ("end-time" in data && index < pages.length - 1) {
                const next_page = pages[index + 1];
                await this.components[next_page.type][next_page.id].update({
                  "start-time": data["end-time"],
                });
              }
            }
          }
        }
      } catch (e) {
        // @todo: handle errors.
        console.error(e);
      }
    },
    delete({ type, id }) {
      const component = this.components?.[type]?.[id];
      if (component) {
        component.$deleted = true;
      }
    },
    restore({ type, id }) {
      const component = this.components?.[type]?.[id];
      if (component) {
        delete component.$deleted;
      }
    },
    async clone(component, data = {}, parent = null) {
      const children_prop = this.getChildrenProperty(component);

      let clone = await this.create(
        {
          ...omit(cloneDeep(component), ["id", children_prop]),
          ...data,
        },
        false
      );

      await this.add(clone, parent, false);

      if (this.hasChildren(component)) {
        for (const c of this.getChildren(component)) {
          await this.clone(c, {}, clone);
        }
      }

      return clone;
    },
    setBlockActivePage(block, index) {
      if (block.synched) {
        const pages = this.getChildren(block);
        const page = pages[index];
        if (page && "start-time" in page) {
          const { seekTo: seekMediaTo } = useModule("media_player");
          seekMediaTo(page["start-time"]);
        }
      } else {
        this.blocksActivePage[block.id] = index;
      }
    },
    show(component) {
      const { type, id } = component;
      if (this.isToggled(component)) {
        this.toggled = this.toggled.filter(
          (t) => !(t.type === type && t.id === id)
        );
      }
    },
    hide(component) {
      const { type, id } = component;
      if (!this.isToggled(component)) {
        this.toggled.push({ type, id });
      }
    },
    toggle(component) {
      if (this.isToggled(component)) {
        this.show(component);
      } else {
        this.hide(component);
      }
    },
  },
  history(context) {
    // @todo: group actions on multiple components
    const {
      name, // Invoked action's name.
      args, // Array of parameters passed to the action.
      after, // Hook called after the action executes.
      push, // Method to push an undo/redo item to the history.
    } = context;

    switch (name) {
      case "update":
        {
          const [component, data] = args;
          const oldValue = Object.keys(data).reduce(
            (acc, key) => ({ ...acc, [key]: unref(component[key]) }),
            {}
          );
          after(() => {
            push({
              undo: async () => {
                await this.update(component, oldValue);
              },
              redo: async () => {
                await this.update(component, data);
              },
            });
          });
        }
        break;

      case "add":
        after((component) => {
          push({
            undo: () => {
              this.delete(component.type, component.id);
            },
            redo: () => {
              this.restore(component.type, component.id);
            },
          });
        });
        break;

      case "restore":
      case "delete":
        {
          const [component] = args;
          after(() => {
            push({
              undo: () => {
                this[name === "delete" ? "restore" : "delete"](component);
              },
              redo: () => {
                this[name](component);
              },
            });
          });
        }
        break;
    }
  },
});
