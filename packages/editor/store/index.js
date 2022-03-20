import { defineStore } from "pinia";
import { omit } from "lodash";
import { useModule } from "@metascore-library/core/services/module-manager";
import { load } from "@metascore-library/core/utils/ajax";

export default defineStore("editor", {
  state: () => {
    return {
      ready: false,
      appTitle: null,
      selectedComponents: new Set(),
      lockedComponents: new Set(),
    };
  },
  getters: {
    isComponentSelected() {
      return (model) => {
        return this.selectedComponents.has(model);
      };
    },
    getSelectedComponents() {
      return Array.from(this.selectedComponents);
    },
    componentHasSelectedDescendents() {
      return (model) => {
        const componentsStore = useModule("app_components").useStore();
        const children = componentsStore.getChildren(model);
        return children.some((child) => {
          if (this.isComponentSelected(child)) {
            return true;
          }

          return this.componentHasSelectedDescendents(child);
        });
      };
    },
    isComponentLocked() {
      return (model) => {
        return this.lockedComponents.has(model);
      };
    },
    getLockedComponents() {
      return Array.from(this.lockedComponents);
    },
    createComponent() {
      return (data) => {
        const componentsStore = useModule("app_components").useStore();
        return componentsStore.create(data);
      };
    },
  },
  actions: {
    updateComponent(model, data) {
      const componentsStore = useModule("app_components").useStore();
      componentsStore.update(model, data);
    },
    updateComponents(models, data) {
      const componentsStore = useModule("app_components").useStore();
      models.forEach((model) => {
        componentsStore.update(model, data);
      });
    },
    addComponent(data, parent) {
      const componentsStore = useModule("app_components").useStore();
      const model = this.createComponent(data);
      componentsStore.add(model, parent);
      return model;
    },
    selectComponent(model, append = false) {
      if (!append) {
        this.deselectAllComponents();
      }
      this.selectedComponents.add(model);
    },
    deselectComponent(model) {
      this.selectedComponents.delete(model);
    },
    deselectComponents(models) {
      models.map(this.deselectComponent);
    },
    deselectAllComponents() {
      this.selectedComponents.clear();
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
    lockComponent(model) {
      this.lockedComponents.add(model);
    },
    lockComponents(models) {
      models.map(this.lockComponent);
    },
    unlockComponent(model) {
      this.lockedComponents.delete(model);
    },
    unlockComponents(models) {
      models.map(this.unlockComponent);
    },
    copyComponent(model) {
      const clipboardStore = useModule("clipboard").useStore();
      const data = omit(model.toJson(), ["id"]);
      clipboardStore.setData(`metascore/component`, data);
    },
    copyComponents(models) {
      models.map(this.copyComponent);
    },
    cutComponent(model) {
      this.copyComponent(model);
      this.deleteComponent(model);
    },
    cutComponents(models) {
      models.map(this.cutComponent);
    },
    deleteComponent(model) {
      model.delete();
    },
    deleteComponents(models) {
      models.map(this.deleteComponent);
    },
    arrangeComponent(model, action) {
      if (model.parent) {
        const componentsStore = useModule("app_components").useStore();
        const parent = componentsStore.getParent(model);
        const children = componentsStore.getChildren(parent);
        const count = children.length;
        const old_index = children.findIndex((child) => {
          return child === model;
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
    moveComponents(models, { left, top }) {
      models.forEach((model) => {
        if (!model.constructor.$isPositionable) {
          return;
        }

        const position = model.position;
        if (left) {
          position[0] += left;
        }
        if (top) {
          position[1] += top;
        }

        this.updateComponent(model, { position });
      });
    },
    setPlayerDimensions({ width, height }) {
      const appRendererStore = useModule("app_renderer").useStore();
      if (typeof width !== "undefined") {
        appRendererStore.width = width;
      }
      if (typeof height !== "undefined") {
        appRendererStore.height = height;
      }
    },
    async load(url) {
      const mediaStore = useModule("media").useStore();
      const componentsStore = useModule("app_components").useStore();
      const appRendererStore = useModule("app_renderer").useStore();
      const assetsStore = useModule("assets_library").useStore();

      const data = await load(url);

      this.appTitle = data.title;

      mediaStore.source = data.media;

      componentsStore.init(data.components);

      assetsStore.init(data.assets);

      appRendererStore.width = data.width;
      appRendererStore.height = data.height;
      appRendererStore.css = data.css;

      this.ready = true;
    },
  },
});
