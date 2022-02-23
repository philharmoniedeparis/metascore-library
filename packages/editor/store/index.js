import { useStore } from "@metascore-library/core/modules/manager";
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
        return this.selectedComponents.has(model.id);
      };
    },
    getSelectedComponents() {
      const componentsStore = useStore("components");
      return Array.from(this.selectedComponents).map(componentsStore.get);
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
        return this.lockedComponents.has(model.id);
      };
    },
    getLockedComponents() {
      const componentsStore = useStore("components");
      return Array.from(this.lockedComponents).map(componentsStore.get);
    },
  },
  actions: {
    selectComponent(model) {
      this.selectedComponents.add(model.id);
    },
    deselectComponent(model) {
      this.selectedComponents.delete(model.id);
    },
    deselectAllComponents() {
      this.selectedComponents.clear();
    },
    lockComponent(model) {
      this.lockedComponents.add(model.id);
    },
    unlockComponent(model) {
      this.lockedComponents.delete(model.id);
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
    addComponent(data, parent) {
      const componentsStore = useStore("components");
      const model = componentsStore.create(data);
      componentsStore.add(model, parent);
      return model;
    },
  },
};
