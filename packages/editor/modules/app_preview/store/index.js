import { defineStore } from "pinia";
import { unref } from "vue";
import { paramCase } from "param-case";
import { cloneDeep, round } from "lodash";
import { useModule } from "@metascore-library/core/services/module-manager";

export const ARRANGE_COMPONENT_NO_PARENT_ERROR = 100;
export const ADD_SIBLING_PAGE_TIME_ERROR = 200;

export class ValidationError extends Error {
  constructor(code, ...params) {
    super(...params);
    this.code = code;
  }
}

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
        const { getComponent } = useModule("app_components");
        return this.selectedComponents.some(({ type, id }) => {
          return (
            component.type === type &&
            component.id === id &&
            getComponent(type, id)
          );
        });
      };
    },
    getSelectedComponents() {
      const { getComponent } = useModule("app_components");
      return this.selectedComponents
        .map(({ type, id }) => {
          return getComponent(type, id);
        })
        .filter((c) => c);
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
        const { getComponent } = useModule("app_components");
        return this.lockedComponents.some(({ type, id }) => {
          return (
            component.type === type &&
            component.id === id &&
            getComponent(type, id)
          );
        });
      };
    },
    getLockedComponents() {
      const { getComponent } = useModule("app_components");
      return this.lockedComponents
        .map(({ type, id }) => {
          return getComponent(type, id);
        })
        .filter((c) => c);
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
    copyComponents(components) {
      const { setData: setClipboardData } = useModule("clipboard");
      const { getComponentChildrenProperty, getComponentChildren } =
        useModule("app_components");

      const recursiveCopy = (component) => {
        const copy = cloneDeep(unref(component));
        delete copy.id;

        const property = getComponentChildrenProperty(component);
        if (property) {
          copy[property] = getComponentChildren(component).map(recursiveCopy);
        }

        return copy;
      };

      setClipboardData("metascore/component", components.map(recursiveCopy));
    },
    async cutComponents(components) {
      const { deleteComponent } = useModule("app_components");
      const { startGroup: startHistoryGroup, endGroup: endHistoryGroup } =
        useModule("history");

      this.copyComponents(components);

      startHistoryGroup();
      for (const component of components) {
        await deleteComponent(component);
      }
      endHistoryGroup();
    },
    getClosestPasteTarget(target) {
      const { getData: getClipboardData } = useModule("clipboard");
      const components = unref(getClipboardData("metascore/component"));

      if (!components) return null;

      const { getModel, getComponentChildrenProperty, getComponentParent } =
        useModule("app_components");
      const model = getModel(target.type);
      const property = getComponentChildrenProperty(target);

      if (property) {
        const can_paste = components.every((component) => {
          return model.schema.properties[
            property
          ].items.properties.type.enum.includes(component.type);
        });

        if (can_paste) return target;
      }

      const parent = getComponentParent(target);
      if (parent) {
        return this.getClosestPasteTarget(parent);
      }

      return null;
    },
    async pasteComponents(target) {
      target = this.getClosestPasteTarget(target);
      if (!target) return;

      const { getComponent, createComponent, addComponent } =
        useModule("app_components");
      const { getData: getClipboardData } = useModule("clipboard");
      const { getComponentChildrenProperty } = useModule("app_components");
      const { startGroup: startHistoryGroup, endGroup: endHistoryGroup } =
        useModule("history");

      const components = [];

      const recursivePaste = async (data, parent) => {
        let children = [];
        const property = getComponentChildrenProperty(data);
        if (property && property in data && data[property]) {
          children = data[property];
          data[property] = [];
        }

        const component = await createComponent(data);
        await addComponent(component, parent);

        for (const child of children) {
          await recursivePaste(child, component);
        }

        return component;
      };

      let data = getClipboardData("metascore/component");
      if (data) {
        data = cloneDeep(unref(data));
        startHistoryGroup();

        let i = 0;
        for (const item of data) {
          if ("position" in item) {
            item.position[0] += 10;
            item.position[1] += 10;
          }

          const component = await recursivePaste(
            item,
            getComponent(target.type, target.id)
          );
          this.selectComponent(component, i++ > 0);
          components.psuh(component);
        }

        endHistoryGroup();
      }

      return components;
    },
    async arrangeComponent(component, action) {
      const {
        getComponentParent,
        getComponentChildrenProperty,
        getComponentChildren,
        updateComponent,
      } = useModule("app_components");

      const parent = getComponentParent(component);
      if (!parent) {
        throw new ValidationError(
          ARRANGE_COMPONENT_NO_PARENT_ERROR,
          `compontent ${component.type}:${component.id} can't be rearranged as it doesn't have a parent`
        );
      }

      const children = getComponentChildren(parent);
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

      const property = getComponentChildrenProperty(parent);
      await updateComponent(parent, {
        [property]: children.map((child) => {
          return { type: child.type, id: child.id };
        }),
      });
    },
    async moveComponents(components, { left, top }) {
      const { getModel, updateComponent } = useModule("app_components");
      const { startGroup: startHistoryGroup, endGroup: endHistoryGroup } =
        useModule("history");

      startHistoryGroup();

      for (const component of components) {
        const model = getModel(component.type);
        if (!model.$isPositionable) return;

        const position = [...component.position];
        if (left) position[0] += left;
        if (top) position[1] += top;

        await updateComponent(component, { position });
      }

      endHistoryGroup();
    },
    async addSiblingPage(page, position = "before") {
      const {
        createComponent,
        addComponent,
        updateComponent,
        setBlockActivePage,
        getComponentParent,
        getComponentChildren,
      } = useModule("app_components");
      let { time: mediaTime, duration: mediaDuration } =
        useModule("media_player");
      const { startGroup: startHistoryGroup, endGroup: endHistoryGroup } =
        useModule("history");

      mediaTime = round(unref(mediaTime), 2);
      mediaDuration = round(unref(mediaDuration), 2);

      const after = position !== "before";
      const block = getComponentParent(page);
      if (!block || block.type !== "Block") return;
      const pages = getComponentChildren(block);
      const index = pages.findIndex((c) => c.id === page.id);

      if (
        block.synched &&
        ((page["start-time"] === null && mediaTime === 0) ||
          page["start-time"] === mediaTime ||
          (page["end-time"] === null && mediaTime === mediaDuration) ||
          mediaTime === page["end-time"])
      ) {
        // Prevent adding the page at start or end of current page.
        throw new ValidationError(
          ADD_SIBLING_PAGE_TIME_ERROR,
          "A new page cannot be added at the start or end time of an existing page"
        );
      }

      startHistoryGroup();

      const new_page = await createComponent({ type: "Page" });
      await addComponent(new_page, block, after ? index + 1 : index);
      if (block.synched) {
        await updateComponent(new_page, {
          "start-time": after ? mediaTime : page["start-time"],
          "end-time": after ? page["end-time"] : mediaTime,
        });
      }

      endHistoryGroup();

      setBlockActivePage(block, after ? index + 1 : index);
      this.selectComponent(new_page);

      return new_page;
    },
  },
});
