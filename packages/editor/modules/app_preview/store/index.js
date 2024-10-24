import { defineStore } from "pinia";
import { unref } from "vue";
import { round } from "lodash";
import { useModule } from "@core/services/module-manager";

const FROZEN_OVERRIDES_KEY = "app_preview:frozen";
const FROZEN_OVERRIDES_PRIORITY = 1000;

export class AddSiblingPageTimeError extends Error {
  constructor() {
    super(
      "A new page cannot be added at the start or end time of an existing page"
    );
  }
}

export default defineStore("app-preview", {
  state: () => {
    return {
      zoom: 1,
      preview: false,
      previewPersistant: false,
      appPreviewEl: null,
      appPreviewRect: { x: 0, y: 0, width: 0, height: 0 },
      appRendererWrapperEl: null,
      appRendererWrapperRect: { x: 0, y: 0, width: 0, height: 0 },
      controlboxContainer: null,
      selectedComponents: {},
      lockedComponents: {},
      frozenComponents: {},
      activeSnapTargets: [],
      editingPlaybackRate: null,
      preservedOverrides: false,
    };
  },
  getters: {
    isComponentSelected() {
      return ({ type, id }) => {
        return this.selectedComponents[type]?.includes(id);
      };
    },
    getSelectedComponents() {
      const { getComponent } = useModule("app_components");
      return Object.entries(this.selectedComponents).reduce(
        (acc, [type, ids]) => {
          return [
            ...acc,
            ...ids
              .map((id) => {
                return getComponent(type, id);
              })
              .filter((c) => c),
          ];
        },
        []
      );
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
      return ({ type, id }) => {
        return this.lockedComponents[type]?.includes(id);
      };
    },
    getLockedComponents() {
      const { getComponent } = useModule("app_components");
      return Object.entries(this.lockedComponents).reduce(
        (acc, [type, ids]) => {
          return [
            ...acc,
            ...ids
              .map((id) => {
                return getComponent(type, id);
              })
              .filter((c) => c),
          ];
        },
        []
      );
    },
    isComponentFrozen() {
      return (component) => {
        const { hasOverrides } = useModule("app_components");
        return hasOverrides(component, FROZEN_OVERRIDES_KEY);
      };
    },
  },
  actions: {
    togglePreview(force, persistant = true) {
      this.preview = typeof force !== "undefined" ? force : !this.preview;
      this.previewPersistant = this.preview && persistant;

      if (this.preview) {
        // Reset playback rate to 1 in preview.
        const { playbackRate, setPlaybackRate } = useModule("media_player");
        this.editingPlaybackRate = unref(playbackRate);
        setPlaybackRate(1);

        useModule("app_behaviors").enable();
      } else {
        if (this.editingPlaybackRate) {
          const { setPlaybackRate } = useModule("media_player");
          setPlaybackRate(this.editingPlaybackRate);
          this.editingPlaybackRate = null;
        }

        if (!this.preservedOverrides) {
          // Reset component overrides and behaviors
          // when exiting preview mode.
          useModule("app_components").clearOverrides();
        }

        useModule("app_behaviors").disable();
      }
    },
    setPreservedOverrides(value = true) {
      this.preservedOverrides = value;
      if (!this.preview && !value) {
        useModule("app_components").clearOverrides();
      }
    },
    selectComponent(component, append = false) {
      if (!append) {
        this.deselectAllComponents();
      }
      if (!this.isComponentSelected(component)) {
        this.selectedComponents[component.type] =
          this.selectedComponents[component.type] || [];
        this.selectedComponents[component.type].push(component.id);
      }
    },
    deselectComponent(component) {
      if (this.isComponentSelected(component)) {
        this.selectedComponents[component.type] = this.selectedComponents[
          component.type
        ].filter((id) => {
          return component.id !== id;
        });
      }
    },
    deselectComponents(components) {
      components.map(this.deselectComponent);
    },
    deselectAllComponents() {
      this.selectedComponents = {};
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
        this.lockedComponents[component.type] =
          this.lockedComponents[component.type] || [];
        this.lockedComponents[component.type].push(component.id);
      }
    },
    lockComponents(components) {
      components.map(this.lockComponent);
    },
    unlockComponent(component) {
      if (this.isComponentLocked(component)) {
        this.lockedComponents[component.type] = this.lockedComponents[
          component.type
        ].filter((id) => {
          return component.id !== id;
        });
      }
    },
    unlockComponents(components) {
      components.map(this.unlockComponent);
    },
    unlockAllComponents() {
      this.lockedComponents = {};
    },
    freezeComponent(component) {
      const { setOverrides } = useModule("app_components");
      if (!this.isComponentFrozen(component)) {
        setOverrides(
          component,
          FROZEN_OVERRIDES_KEY,
          structuredClone(component.data),
          FROZEN_OVERRIDES_PRIORITY
        );
      }
    },
    unfreezeComponent(component) {
      const { clearOverrides } = useModule("app_components");
      clearOverrides(component, FROZEN_OVERRIDES_KEY);
    },
    copyComponents(components) {
      const { setData: setClipboardData } = useModule("clipboard");
      const {
        getComponentChildrenProperty,
        getComponentChildren,
        getComponentIndex,
      } = useModule("app_components");

      const recursiveCopy = (component) => {
        const copy = structuredClone(component.data);
        delete copy.id;

        const property = getComponentChildrenProperty(component);
        if (property) {
          copy[property] = getComponentChildren(component).map(recursiveCopy);
        }

        return copy;
      };

      setClipboardData(
        "metascore/component",
        components
          .toSorted((a, b) => {
            return getComponentIndex(a) - getComponentIndex(b);
          })
          .map(recursiveCopy)
      );
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

      const {
        getModelByType,
        getComponentChildrenProperty,
        getComponentParent,
      } = useModule("app_components");
      const model = getModelByType(target.type);
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

      const { createComponent, addComponent } = useModule("app_components");
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

        const component = await createComponent(data, false);
        await addComponent(component, parent);

        for (const child of children) {
          await recursivePaste(child, component);
        }

        return component;
      };

      let data = getClipboardData("metascore/component");
      if (data) {
        data = structuredClone(unref(data));
        startHistoryGroup();

        let i = 0;
        for (const item of data) {
          if ("position" in item) {
            item.position[0] += 10;
            item.position[1] += 10;
          }

          const component = await recursivePaste(item, target);
          this.selectComponent(component, i++ > 0);
          components.push(component);
        }

        endHistoryGroup();
      }

      return components;
    },
    async moveComponents(components, { left, top }) {
      const { getModelByType, updateComponent } = useModule("app_components");
      const { startGroup: startHistoryGroup, endGroup: endHistoryGroup } =
        useModule("history");

      startHistoryGroup();

      for (const component of components) {
        const model = getModelByType(component.type);
        if (!model.$isPositionable) return;

        const position = [...component.position];
        if (left) position[0] += left;
        if (top) position[1] += top;

        await updateComponent(component, { position });
      }

      endHistoryGroup();
    },
    async addSiblingPage(page, position = "before", data = {}) {
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

      if (block.synched) {
        if (
          (page["start-time"] === null && mediaTime === 0) ||
          page["start-time"] === mediaTime ||
          (page["end-time"] === null && mediaTime === mediaDuration) ||
          page["end-time"] === mediaTime
        ) {
          // Prevent adding the page at start or end of current page.
          throw new AddSiblingPageTimeError();
        }
      }

      startHistoryGroup();

      const new_page = await createComponent({
        ...data,
        type: "Page",
        "start-time": block.synched
          ? page[after ? "end-time" : "start-time"]
          : null,
        "end-time": block.synched
          ? page[after ? "end-time" : "start-time"]
          : null,
      });
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
