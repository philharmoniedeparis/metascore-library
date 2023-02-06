import { defineStore } from "pinia";
import { readonly, unref, isReadonly } from "vue";
import { omit, cloneDeep } from "lodash";
import { normalize, denormalize } from "./utils/normalize";
import { useModule } from "@metascore-library/core/services/module-manager";
import { t as $t } from "@metascore-library/core/services/i18n";
import * as Models from "../models";

export default defineStore("app-components", {
  state: () => {
    return {
      components: {},
      activeScenario: null,
      blocksActivePage: {},
      overrides: new Map(),
      overridesEnabled: false,
    };
  },
  getters: {
    get() {
      return (type, id) => {
        const component = this.components?.[type]?.[id];
        return component && !component.$deleted ? readonly(component) : null;
      };
    },
    all() {
      return []
        .concat(...Object.values(this.components).map((v) => Object.values(v)))
        .map((c) => this.get(c.type, c.id))
        .filter((c) => c);
    },
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
    getModelByType() {
      return (type) => {
        return Models[type];
      };
    },
    getModelByMime() {
      return (mime) => {
        return Object.values(Models).find((model) => model.mime === mime);
      };
    },
    getLabel() {
      return (component) => {
        switch (component.type) {
          case "Page": {
            const block = this.getParent(component);
            const pages = this.getChildren(block);
            const count = pages.length;
            const index = pages.findIndex((c) => c.id === component.id) + 1;
            return $t("app_components.page_label", { index, count });
          }

          default:
            return component.name || $t("app_components.untitled");
        }
      };
    },
    getChildrenProperty() {
      return (component) => {
        return this.getModelByType(component.type).childrenProperty;
      };
    },
    hasChildren() {
      return (component) => {
        const property = this.getChildrenProperty(component);
        return property && component[property]?.length > 0;
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
          }
        }

        return await Models[data.type].create(data, validate);
      }
    },
    async add(component, parent = null, index = null) {
      this.components[component.type] = this.components[component.type] || {};
      this.components[component.type][component.id] = component;

      if (parent) {
        component.$parent = {
          type: parent.type,
          id: parent.id,
        };

        const children_prop = this.getChildrenProperty(parent);

        let children = parent[children_prop] || [];
        if (index !== null) {
          children = [
            ...children.slice(0, index),
            { type: component.type, id: component.id },
            ...children.slice(index),
          ];
        } else {
          children = children.concat([
            { type: component.type, id: component.id },
          ]);
        }

        await this.update(parent, {
          [children_prop]: children,
        });
      }

      // @todo: run same checks as in update

      return component;
    },
    async update(component, data) {
      try {
        if ("start-time" in data || "end-time" in data) {
          const parent = this.getParent(component);
          if (parent && this.getModelByType(parent.type).$isTimeable) {
            if ("start-time" in data && data["start-time"] !== null) {
              data["start-time"] = Math.max(
                data["start-time"],
                parent["start-time"] ?? 0
              );
            }
            if ("end-time" in data && data["end-time"] !== null) {
              const { duration: mediaDuration } = useModule("media_player");
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
    async delete(component) {
      const { type, id } = component;

      if (isReadonly(component)) {
        component = this.components?.[type]?.[id];
      }

      if (type === "Page") {
        const block = this.getParent(component);
        if (block.synched) {
          const pages = this.getChildren(block);
          const index = pages.findIndex((c) => c.id === component.id);

          let mid_time = component["end-time"] - component["start-time"];
          if (component["start-time"] !== null) {
            mid_time = component["start-time"];
          }
          if (component["end-time"] !== null) {
            mid_time =
              mid_time !== null
                ? mid_time + (component["end-time"] - mid_time) / 2
                : component["end-time"];
          }

          if (index < pages.length - 1) {
            const next_page = pages[index + 1];
            await this.components[next_page.type][next_page.id].update({
              "start-time": component["start-time"] !== null ? mid_time : null,
            });
          }
          if (index > 0) {
            const prev_page = pages[index - 1];
            await this.components[prev_page.type][prev_page.id].update({
              "end-time": component["end-time"] !== null ? mid_time : null,
            });
          }
        }
      }

      component.$deleted = true;
    },
    async restore(component) {
      const { type, id } = component;

      if (isReadonly(component)) {
        component = this.components?.[type]?.[id];
      }

      delete component.$deleted;

      if (type === "Page") {
        const block = this.getParent(component);
        if (block.synched) {
          const pages = this.getChildren(block);
          const index = pages.findIndex((c) => c.id === component.id);

          if (index < pages.length - 1) {
            const next_page = pages[index + 1];
            await this.components[next_page.type][next_page.id].update({
              "start-time": component["end-time"],
            });
          }
          if (index > 0) {
            const prev_page = pages[index - 1];
            await this.components[prev_page.type][prev_page.id].update({
              "end-time": component["start-time"],
            });
          }
        }
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
    enableOverrides() {
      this.overridesEnabled = true;
    },
    disableOverrides() {
      this.overridesEnabled = false;
    },

    /**
     * Check if overrides are set.
     *
     * @param {object} component The component.
     * @param {[string]} key An overrides' key to check against.
     */
    hasOverrides(component, key) {
      if (component) {
        const { type, id } = component;
        if (!this.overrides.has(`${type}:${id}`)) {
          return false;
        }

        const overrides = this.overrides.get(`${type}:${id}`);
        if (key) return overrides.has(key);
        return true;
      }

      return this.overrides.size > 0;
    },

    /**
     * Add/update a set of data overrides.
     *
     * @param {object} component The component.
     * @param {string} key A key to identify the overrides.
     * @param {object} values The data to override.
     * @param {[number = 0]} priority The overrides' priority, overrides with higher priority will have precedence.
     */
    setOverrides(component, key, values, priority) {
      const { type, id } = component;
      if (!this.hasOverrides(`${type}:${id}`)) {
        this.overrides.set(`${type}:${id}`, new Map());
      }

      const overrides = this.overrides.get(`${type}:${id}`);
      const existing = overrides.get(key) ?? {
        priority: 0,
      };

      overrides.set(key, {
        values,
        priority: priority ?? existing.priority,
      });
    },

    /**
     * Get a set of data overrides.
     *
     * @param {object} component The component.
     * @param {string} key A key to identify the overrides.
     * @return {object | Map} The associated data, or a Map of associated data.
     */
    getOverrides(component, key) {
      if (component) {
        const { type, id } = component;
        const overrides = this.overrides.get(`${type}:${id}`);
        if (key) {
          return overrides.get(key);
        }

        return overrides;
      }

      return this.overrides;
    },

    /**
     * Delete a set of overrides.
     *
     * @param {object} component The component.
     * @param {string} key The overrides' key.
     */
    clearOverrides(component, key) {
      if (component) {
        const { type, id } = component;
        if (this.hasOverrides(component, key)) {
          if (key) {
            // Delete specific overrides for a specific component.
            this.overrides.get(`${type}:${id}`).delete(key);
          } else {
            // Delete all overrides for a specific component.
            this.overrides.delete(`${type}:${id}`);
          }
        }
      } else if (key) {
        // Delete specific overrides for all components.
        this.overrides.forEach((overrides) => {
          overrides.delete(key);
        });
      } else {
        // Delete all overrides.
        this.overrides.clear();
      }
    },
  },
  history(context) {
    const {
      name, // Invoked action's name.
      args, // Array of parameters passed to the action.
      after, // Hook called after the action executes.
      push, // Method to push an undo/redo item to the history.
    } = context;

    switch (name) {
      case "add":
        after((component) => {
          push({
            undo: async () => {
              await this.delete(component);
            },
            redo: async () => {
              await this.restore(component);
            },
          });
        });
        break;

      case "update":
        {
          const [component, data] = args;
          const oldValue = structuredClone(
            Object.keys(data).reduce(
              (acc, key) => ({ ...acc, [key]: unref(component[key]) }),
              {}
            )
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

      case "delete":
        {
          const [component] = args;
          after(() => {
            push({
              undo: async () => {
                await this.restore(component);
              },
              redo: async () => {
                await this.delete(component);
              },
            });
          });
        }
        break;
    }
  },
});
