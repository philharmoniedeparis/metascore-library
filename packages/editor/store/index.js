import { defineStore } from "pinia";
import { unref } from "vue";
import { omit } from "lodash";
import { useModule } from "@metascore-library/core/services/module-manager";
import { load } from "@metascore-library/core/utils/ajax";

export default defineStore("editor", {
  state: () => {
    return {
      ready: false,
      appTitle: null,
      selectedComponents: [],
      lockedComponents: [],
    };
  },
  getters: {
    appWidth() {
      const appRendererStore = useModule("app_renderer").useStore();
      return appRendererStore.width;
    },
    appHeight() {
      const appRendererStore = useModule("app_renderer").useStore();
      return appRendererStore.height;
    },
    mediaSource() {
      const mediaStore = useModule("media").useStore();
      return mediaStore.source;
    },
    isComponentSelected() {
      return (component) => {
        return this.selectedComponents.find(({ type, id }) => {
          return component.type === type && component.id === id;
        });
      };
    },
    getSelectedComponents() {
      const componentsStore = useModule("app_components").useStore();
      return this.selectedComponents.map(({ type, id }) => {
        return componentsStore.get(type, id);
      });
    },
    componentHasSelectedDescendents() {
      return (component) => {
        const componentsStore = useModule("app_components").useStore();
        const children = componentsStore.getChildren(component);
        return children.some((child) => {
          if (this.isComponentSelected(child)) {
            return true;
          }

          return this.componentHasSelectedDescendents(child);
        });
      };
    },
    isComponentLocked() {
      return (component) => {
        return this.lockedComponents.find(({ type, id }) => {
          return component.type === type && component.id === id;
        });
      };
    },
    getLockedComponents() {
      const componentsStore = useModule("app_components").useStore();
      return this.lockedComponents.map(({ type, id }) => {
        return componentsStore.get(type, id);
      });
    },
    createComponent() {
      return (data) => {
        const componentsStore = useModule("app_components").useStore();
        return componentsStore.create(data);
      };
    },
  },
  actions: {
    setAppTitle(value) {
      this.appTitle = value;
    },
    setAppWidth(value) {
      const appRendererStore = useModule("app_renderer").useStore();
      appRendererStore.width = value;
    },
    setAppHeight(value) {
      const appRendererStore = useModule("app_renderer").useStore();
      appRendererStore.height = value;
    },
    setMediaSource(value) {
      const mediaStore = useModule("media").useStore();
      mediaStore.source = value;
    },
    updateComponent(component, data) {
      const componentsStore = useModule("app_components").useStore();
      componentsStore.update(component, data);
    },
    updateComponents(models, data) {
      const componentsStore = useModule("app_components").useStore();
      models.forEach((component) => {
        componentsStore.update(component, data);
      });
    },
    addComponent(data, parent) {
      const componentsStore = useModule("app_components").useStore();
      const component = this.createComponent(data);
      componentsStore.add(component, parent);
      return component;
    },
    selectComponent(component, append = false) {
      if (!append) {
        this.deselectAllComponents();
      }
      if (!this.isComponentSelected(component)) {
        this.selectedComponents.push({
          type: component.type,
          id: component.id,
        });
      }
    },
    deselectComponent(component) {
      this.selectedComponents = this.selectedComponents.filter(
        ({ type, id }) => {
          return component.type === type && component.id === id;
        }
      );
    },
    deselectComponents(models) {
      models.map(this.deselectComponent);
    },
    deselectAllComponents() {
      this.selectedComponents = [];
    },
    moveComponentSelection(reverse = false) {
      const selected = this.getSelectedComponents;
      if (selected.length > 0) {
        const componentsStore = useModule("app_components").useStore();
        const master = selected[0];
        const parent = componentsStore.getParent(master);
        const children = componentsStore.getChildren(parent);
        const count = children.length;
        let index = children.findIndex((child) => {
          return child === master;
        });

        index += reverse ? -1 : 1;

        if (index < 0) {
          index = count - 1;
        } else if (index >= count) {
          index = 0;
        }

        this.selectComponent(children[index]);
      }
    },
    lockComponent(component) {
      if (!this.isComponentLocked(component)) {
        this.lockedComponents.push({
          type: component.type,
          id: component.id,
        });
      }
    },
    lockComponents(models) {
      models.map(this.lockComponent);
    },
    unlockComponent(component) {
      this.lockedComponents = this.lockedComponents.filter(({ type, id }) => {
        return component.type === type && component.id === id;
      });
    },
    unlockComponents(models) {
      models.map(this.unlockComponent);
    },
    unlockAllComponents() {
      this.lockedComponents = [];
    },
    copyComponent(component) {
      const clipboardStore = useModule("clipboard").useStore();
      const data = omit(component, ["id"]);
      clipboardStore.setData(`metascore/component`, data);
    },
    copyComponents(models) {
      models.map(this.copyComponent);
    },
    cutComponent(component) {
      this.copyComponent(component);
      this.deleteComponent(component);
    },
    cutComponents(models) {
      models.map(this.cutComponent);
    },
    deleteComponent(component) {
      const componentsStore = useModule("app_components").useStore();
      componentsStore.delete(component.type, component.id);
    },
    deleteComponents(models) {
      models.map(this.deleteComponent);
    },
    restoreComponent(component) {
      const componentsStore = useModule("app_components").useStore();
      componentsStore.restore(component.type, component.id);
    },
    restoreComponents(models) {
      models.map(this.restoreComponent);
    },
    arrangeComponent(component, action) {
      if (component.$parent) {
        const componentsStore = useModule("app_components").useStore();
        const parent = componentsStore.getParent(component);
        const children = componentsStore.getChildren(parent);
        const count = children.length;
        const old_index = children.findIndex((child) => {
          return child === component;
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

        const property = componentsStore.getChildrenProperty(parent);
        this.updateComponent(parent, {
          [property]: children.map((child) => {
            return { schema: child.type, id: child.id };
          }),
        });
      }
    },
    addPageBefore() {
      // @todo
      console.log("addPageBefore");
    },
    addPageAfter() {
      // @todo
      console.log("addPageAfter");
    },
    moveComponents(components, { left, top }) {
      const componentsStore = useModule("app_components").useStore();
      components.forEach((component) => {
        const model = componentsStore.getModel(component.type);
        if (!model.$isPositionable) {
          return;
        }

        const position = component.position;
        if (left) {
          position[0] += left;
        }
        if (top) {
          position[1] += top;
        }

        this.updateComponent(component, { position });
      });
    },
    async load(url) {
      const mediaStore = useModule("media").useStore();
      const componentsStore = useModule("app_components").useStore();
      const appRendererStore = useModule("app_renderer").useStore();
      const assetsStore = useModule("assets_library").useStore();
      const historyStore = useModule("history").useStore();

      const data = await load(url);

      this.appTitle = data.title;
      mediaStore.source = data.media;

      componentsStore.init(data.components);
      assetsStore.init(data.assets);

      appRendererStore.width = data.width;
      appRendererStore.height = data.height;
      appRendererStore.css = data.css;

      historyStore.active = true;

      this.ready = true;
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
      case "setAppTitle":
      case "setAppWidth":
      case "setAppHeight":
      case "setMediaSource":
        {
          const key = name.slice(3, 4).toLowerCase() + name.slice(4);
          const oldValue = this[key];
          after(() => {
            const newValue = this[key];
            push({
              undo: () => {
                this[name](oldValue);
              },
              redo: () => {
                this[name](newValue);
              },
            });
          });
        }
        break;

      case "updateComponent":
        {
          const [component, data] = args;
          const oldValue = Object.keys(data).reduce(
            (acc, key) => ({ ...acc, [key]: unref(component[key]) }),
            {}
          );
          after(() => {
            push({
              undo: () => {
                this.updateComponent(component, oldValue);
              },
              redo: () => {
                this.updateComponent(component, data);
              },
            });
          });
        }
        break;

      case "updateComponents":
        {
          const [components, data] = args;
          const oldValues = components.map((component) => {
            return {
              component,
              data: Object.keys(data).reduce(
                (acc, key) => ({ ...acc, [key]: unref(component[key]) }),
                {}
              ),
            };
          });

          after(() => {
            push({
              undo: () => {
                oldValues.forEach(({ component, data }) => {
                  this.updateComponent(component, data);
                });
              },
              redo: () => {
                this.updateComponents(components, data);
              },
            });
          });
        }
        break;

      case "addComponent":
        after((component) => {
          push({
            undo: () => {
              this.deleteComponent(component);
            },
            redo: () => {
              this.restoreComponent(component);
            },
          });
        });
        break;

      case "restoreComponent":
      case "restoreComponents":
      case "deleteComponent":
      case "deleteComponents":
        {
          const arg = args[0];
          after(() => {
            push({
              undo: () => {
                switch (name) {
                  case "restoreComponent":
                    this.deleteComponent(arg);
                    break;
                  case "restoreComponents":
                    this.deleteComponents(arg);
                    break;
                  case "deleteComponent":
                    this.restoreComponent(arg);
                    break;
                  case "deleteComponents":
                    this.restoreComponents(arg);
                    break;
                }
              },
              redo: () => {
                this[name](arg);
              },
            });
          });
        }
        break;
    }
  },
});
