import { defineStore } from "pinia";
import { paramCase } from "param-case";
import { omit, cloneDeep } from "lodash";
import { useModule } from "@metascore-library/core/services/module-manager";

export default defineStore("app-preview", {
  state: () => {
    return {
      zoom: 1,
      preview: false,
      iframe: null,
      selectedComponents: [],
      lockedComponents: [],
      activeSnapTargets: [],
    };
  },
  getters: {
    getComponentElement() {
      return (component) => {
        return this.iframe.contentDocument.body.querySelector(
          `.metaScore-component.${paramCase(component.type)}#${component.id}`
        );
      };
    },
    isComponentSelected() {
      return (component) => {
        return this.selectedComponents.some(({ type, id }) => {
          return component.type === type && component.id === id;
        });
      };
    },
    getSelectedComponents() {
      const { getComponent } = useModule("app_components");
      return this.selectedComponents.map(({ type, id }) => {
        return getComponent(type, id);
      });
    },
    componentHasSelectedDescendents() {
      return (component) => {
        const { getComponentChildren } = useModule("app_components");
        const children = getComponentChildren(component);
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
        return this.lockedComponents.some(({ type, id }) => {
          return component.type === type && component.id === id;
        });
      };
    },
    getLockedComponents() {
      const { getComponent } = useModule("app_components");
      return this.lockedComponents.map(({ type, id }) => {
        return getComponent(type, id);
      });
    },
  },
  actions: {
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
          return !(component.type === type && component.id === id);
        }
      );
    },
    deselectComponents(components) {
      components.map(this.deselectComponent);
    },
    deselectAllComponents() {
      this.selectedComponents = [];
    },
    moveComponentSelection(reverse = false) {
      const selected = this.getSelectedComponents;
      if (selected.length > 0) {
        const { getComponentParent, getComponentChildren } =
          useModule("app_components");
        const master = selected[0];
        const parent = getComponentParent(master);
        const children = getComponentChildren(parent);
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
    lockComponents(components) {
      components.map(this.lockComponent);
    },
    unlockComponent(component) {
      this.lockedComponents = this.lockedComponents.filter(({ type, id }) => {
        return !(component.type === type && component.id === id);
      });
    },
    unlockComponents(components) {
      components.map(this.unlockComponent);
    },
    unlockAllComponents() {
      this.lockedComponents = [];
    },
    copyComponent(component) {
      const { setData: setClipboardData } = useModule("clipboard");
      const data = omit(component, ["id"]);
      setClipboardData(`metascore/component`, data);
    },
    copyComponents(components) {
      components.map(this.copyComponent);
    },
    cutComponent(component) {
      const { deleteComponent } = useModule("app_components");
      this.copyComponent(component);
      deleteComponent(component);
    },
    cutComponents(components) {
      components.map(this.cutComponent);
    },
    pasteComponent(component, parent) {
      // @todo: implement
      console.log("pasteComponent", component, parent);
    },
    pasteComponents(components, parent) {
      components.map((c) => this.pasteComponent(c, parent));
    },
    async cloneComponent(component, data = {}) {
      const {
        getComponentChildrenProperty,
        componentHasChildren,
        getComponentChildren,
        createComponent,
        addComponent,
      } = useModule("app_components");
      const clone = await createComponent(
        {
          ...omit(cloneDeep(component), ["id"]),
          ...data,
        },
        false
      );

      if (componentHasChildren(component)) {
        const children = [];
        const children_prop = getComponentChildrenProperty(component);
        getComponentChildren(component).forEach((c) => {
          const child = this.cloneComponent(c, {
            $parent: { schema: clone.type, id: clone.id },
          });
          children.push({
            schema: child.type,
            id: child.id,
          });
        });
        clone[children_prop] = children;
      }

      await addComponent(clone);

      return clone;
    },
    arrangeComponent(component, action) {
      if (component.$parent) {
        const {
          getComponentParent,
          getComponentChildrenProperty,
          getComponentChildren,
          updateComponent,
        } = useModule("app_components");
        const parent = getComponentParent(component);
        const children = getComponentChildren(parent);
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

        const property = getComponentChildrenProperty(parent);
        updateComponent(parent, {
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
      const { getModel, updateComponent } = useModule("app_components");
      components.forEach((component) => {
        const model = getModel(component.type);
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

        updateComponent(component, { position });
      });
    },
  },
});
