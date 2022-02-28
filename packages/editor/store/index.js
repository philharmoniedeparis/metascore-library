import { omit } from "lodash";
import { useStore } from "@metascore-library/core/module-manager";
import { load } from "@metascore-library/core/utils/ajax";

export default {
  state: () => {
    return {
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
        const componentsStore = useStore("components");
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
  },
  actions: {
    updateComponent(model, data) {
      const componentsStore = useStore("components");
      componentsStore.update(model, data);
    },
    updateComponents(models, data) {
      const componentsStore = useStore("components");
      models.forEach((model) => {
        componentsStore.update(model, data);
      });
    },
    createComponent(data) {
      const componentsStore = useStore("components");
      return componentsStore.create(data);
    },
    addComponent(data, parent) {
      const componentsStore = useStore("components");
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
        const componentsStore = useStore("components");
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
      const clipboardStore = useStore("clipboard");
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
        const componentsStore = useStore("components");
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
        if (!model.$isPositionable) {
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
    async load(url) {
      const mediaStore = useStore("media");
      const componentsStore = useStore("components");
      const appRendererStore = useStore("app-renderer");
      const assetsStore = useStore("assets");

      const data = await load(url);

      mediaStore.source = data.media;

      componentsStore.init(data.components);

      assetsStore.init(data.assets);

      appRendererStore.width = data.width;
      appRendererStore.height = data.height;
      appRendererStore.css = data.css;
      appRendererStore.ready = true;
    },
  },
};
