import { defineStore } from "pinia";
import { readonly, unref, isReadonly } from "vue";
import { omit } from "lodash";
import { normalize, denormalize } from "./utils/normalize";
import { useModule } from "@core/services/module-manager";
import { t as $t } from "@core/services/i18n";
import * as Models from "../models";
import { toRawDeep } from "@core/utils/object";

export default defineStore("app-components", {
  state: () => {
    return {
      components: {},
      deleted: {},
      sortedScenarios: [],
      activeScenario: null,
      blocksActivePage: new Map(),
      overrides: new Map(),
      overridesEnabled: false,
    };
  },
  getters: {
    get() {
      return (type, id) => {
        const component = this.components?.[type]?.[id];
        return component ? readonly(component) : null;
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
    getSortedScenarios() {
      return () => {
        const scenarios = this.getByType("Scenario");
        return this.sortedScenarios.reduce((acc, sortedScenario) => {
          const scenario = scenarios.find((s) => s.id === sortedScenario);
          if (scenario) acc.push(scenario);
          return acc;
        }, []);
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
            return $t("app_components.labels.Page", { index, count });
          }

          default:
            return component.name || $t("app_components.labels.untitled");
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
    getIndex() {
      return (component) => {
        const parent = this.getParent(component);
        if (parent) {
          return this.getChildren(parent).findIndex((c) => {
            return c.type === component.type && c.id === component.id;
          });
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
        const input = this.getSortedScenarios().map((scenario) => {
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
      this.sortedScenarios = normalized.result.map(({ id }) => id);
      this.activeScenario = this.sortedScenarios[0];
    },
    setScenarioIndex(scenario, index) {
      const old_index = this.sortedScenarios.findIndex(
        (id) => id === scenario.id
      );

      if (old_index === -1) {
        throw new Error(
          `scenario ${scenario.id} can't be moved as it doesn't exist`
        );
      }

      const value = this.sortedScenarios.splice(old_index, 1).at(0);
      this.sortedScenarios.splice(index, 0, value);
    },
    async create(data, validate = true) {
      if (data.type in Models) {
        if (!("slug" in data)) {
          switch (data.type) {
            case "Scenario":
              {
                // Generate a user-freindly slug.
                const next_suffix = this.getByType("Scenario").reduce(
                  (acc, c) => {
                    const suffix = parseInt(
                      c.slug?.replace("scenario-", "") ?? -1,
                      10
                    );
                    return !isNaN(suffix) ? Math.max(acc, suffix + 1) : acc;
                  },
                  1
                );
                data.slug = `scenario-${next_suffix}`;
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
        if (isReadonly(parent)) {
          parent = this.components[parent.type][parent.id];
        }

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
          children.push({ type: component.type, id: component.id });
        }

        await this.update(parent, {
          [children_prop]: children,
        });
      }

      if (component.type === "Scenario") {
        this.sortedScenarios.push(component.id);
      }

      // @todo: run same checks as in update

      return component;
    },
    async update(component, data) {
      if (isReadonly(component)) {
        component = this.components[component.type][component.id];
      }

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
              const { duration: mediaDuration } = useModule("core:media_player");
              data["end-time"] = Math.min(
                data["end-time"],
                parent["end-time"] ?? unref(mediaDuration)
              );
            }
          }
        }

        await component.update(data);

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
    async arrange(component, action) {
      const parent = this.getParent(component);
      if (!parent) {
        throw new Error(
          `compontent ${component.type}:${component.id} can't be rearranged as it doesn't have a parent`
        );
      }

      const children = this.getChildren(parent);
      const count = children.length;
      const old_index = children.findIndex((child) => {
        return child.type === component.type && child.id === component.id;
      });

      let new_index = null;
      switch (action) {
        case "front":
          new_index = count - 1;
          break;
        case "back":
          new_index = 0;
          break;
        case "forward":
          new_index = Math.min(old_index + 1, count - 1);
          break;
        case "backward":
          new_index = Math.max(old_index - 1, 0);
          break;
      }

      if (new_index !== null && new_index !== old_index) {
        children.splice(new_index, 0, children.splice(old_index, 1)[0]);
      }

      const property = this.getChildrenProperty(parent);
      await this.update(parent, {
        [property]: children.map((child) => {
          return { type: child.type, id: child.id };
        }),
      });
    },
    async delete(component) {
      const { type, id } = component;

      if (!this.components[type]?.[id]) return;

      if (isReadonly(component)) {
        component = this.components[type][id];
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

      if (!this.deleted[type]) this.deleted[type] = {};
      this.deleted[type][id] = component;

      delete this.components[type][id];
    },
    async restore(component) {
      const { type, id } = component;

      if (!this.deleted[type]?.[id]) return;

      if (isReadonly(component)) {
        component = this.deleted[type][id];
      }

      if (!this.components[type]) this.components[type] = {};
      this.components[type][id] = component;

      delete this.deleted[type][id];

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
          ...omit(structuredClone(toRawDeep(component.data)), ["id", children_prop]),
          ...data,
        },
        false
      );

      await this.add(clone, parent);

      if (this.hasChildren(component)) {
        for (const c of this.getChildren(component)) {
          await this.clone(c, {}, clone);
        }
      }

      return clone;
    },
    setBlockActivePage(block, index) {
      if (block.synched) {
        const { seekTo: seekMediaTo } = useModule("core:media_player");
        const pages = this.getChildren(block);
        const page = pages[index];
        seekMediaTo(page["start-time"] ?? 0);
      } else {
        this.blocksActivePage.set(block.id, index);
      }
    },
    resetBlocksActivePage() {
      this.blocksActivePage.clear();
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
          return overrides?.get(key);
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
      case "setScenarioIndex":
        {
          const [scenario, index] = args;
          const old_index = this.sortedScenarios.findIndex(
            (id) => id === scenario.id
          );

          after(() => {
            push({
              undo: () => {
                this.setScenarioIndex(scenario, old_index);
              },
              redo: () => {
                this.setScenarioIndex(scenario, index);
              },
            });
          });
        }
        break;

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
          const old_value = structuredClone(
            Object.keys(data).reduce(
              (acc, key) => ({ ...acc, [key]: toRawDeep(component[key]) }),
              {}
            )
          );

          after(() => {
            push({
              undo: async () => {
                await this.update(component, old_value);
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
