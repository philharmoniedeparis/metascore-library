import { defineStore } from "pinia";
import { unref } from "vue";
import { omit, cloneDeep } from "lodash";
import { useModule } from "@metascore-library/core/services/module-manager";
import * as api from "../api";

export default defineStore("editor", {
  state: () => {
    return {
      loading: false,
      saving: false,
      appTitle: null,
      revisions: [],
      latestRevision: null,
      activeRevision: null,
      selectedComponents: [],
      lockedComponents: [],
      dirty: new Map(),
    };
  },
  getters: {
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
    isDirty() {
      return (key, since = null) => {
        if (since) {
          if (typeof key !== "undefined") {
            return this.dirty.has(key) && this.dirty.get(key) >= since;
          }

          return Array.from(this.dirty.values()).some((value) => {
            return value >= since;
          });
        }

        return typeof key !== "undefined"
          ? this.dirty.has(key)
          : this.dirty.size > 0;
      };
    },
    getDirtyData() {
      return (since = null) => {
        const data = new FormData();
        if (this.isDirty("metadata", since)) {
          data.set("title", this.appTitle);
          data.set("width", this.appWidth);
          data.set("height", this.appHeight);
        }
        if (this.isDirty("media", since)) {
          const mediaSource = unref(useModule("media_player").source);
          if ("file" in mediaSource) {
            data.set("files[media]", mediaSource.file);
          }
          data.set("media", JSON.stringify(omit(mediaSource, ["file"])));
        }
        if (this.isDirty("components", since)) {
          const { json } = useModule("app_components");
          data.set("components", JSON.stringify(json));
        }
        if (this.isDirty("assets", since)) {
          const { assets } = useModule("assets_library");
          if (assets.length > 0) {
            assets.forEach((asset) => {
              data.append("assets[]", JSON.stringify(asset));
            });
          } else {
            data.set("assets", []);
          }
        }
        return data;
      };
    },
  },
  actions: {
    async setData(data) {
      this.revisions = data.revisions;
      this.latestRevision = data.latest_revision;
      this.activeRevision = data.vid;

      this.setAppTitle(data.title);
      this.$onAction(({ name }) => {
        switch (name) {
          case "setAppTitle":
            this.setDirty("metadata");
            break;
        }
      });

      const { width, height, css } = data;
      const {
        init: initAppRenderer,
        addStoreActionListener: addAppRendererStoreActionListener,
      } = useModule("app_renderer");
      initAppRenderer({ width, height, css });
      addAppRendererStoreActionListener(({ name }) => {
        if (["width", "height"].includes(name)) {
          this.setDirty("media");
        }
      });

      const {
        setSource: setMediaSource,
        addStoreActionListener: addMediaStoreActionListener,
      } = useModule("media_player");
      setMediaSource(data.media);
      addMediaStoreActionListener(({ name }) => {
        if (["setSource"].includes(name)) {
          this.setDirty("media");
        }
      });

      const {
        init: initComponents,
        addStoreActionListener: addComponentsStoreActionListener,
        activeScenario,
        setActiveScenario,
      } = useModule("app_components");
      await initComponents(data.components);
      addComponentsStoreActionListener(({ name, args }) => {
        if (["add", "update", "delete"].includes(name)) {
          this.setDirty("components");

          if (name === "delete") {
            const [type, id] = args;
            if (type === "Scenario" && id === activeScenario) {
              setActiveScenario(this.scenarios[0]?.id);
            }
          }
        }
      });

      const {
        init: initAssets,
        addStoreActionListener: addAssetsStoreActionListener,
      } = useModule("assets_library");
      initAssets(data.assets);
      addAssetsStoreActionListener(({ name }) => {
        if (["add", "delete"].includes(name)) {
          this.setDirty("assets");
        }
      });

      const { activate: activateHistory } = useModule("history");
      activateHistory();
    },
    setAppTitle(value) {
      this.appTitle = value;
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
      this.copyComponent(component);
      this.deleteComponent(component);
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
    setDirty(key) {
      this.dirty.set(key, Date.now());
    },
    async load(url) {
      this.loading = true;

      const data = await api.get(url);
      await this.setData(data);

      this.loading = false;
    },
    save(url) {
      this.saving = true;

      return api
        .save(url, this.getDirtyData())
        .then(() => {
          this.dirty.clear();
        })
        .finally(() => {
          this.saving = false;
        });
    },
    loadRevision(vid) {
      const revision = this.revisions.find((r) => r.vid === vid);
      if (revision) {
        return this.load(revision.url);
      }
    },
    restoreRevision(url, vid) {
      this.saving = true;

      return api
        .restore(url, vid)
        .then(async (data) => {
          await this.setData(data);
        })
        .finally(() => {
          this.saving = false;
        });
    },
  },
  history(context) {
    const {
      name, // Invoked action's name.
      after, // Hook called after the action executes.
      push, // Method to push an undo/redo item to the history.
    } = context;

    switch (name) {
      case "setAppTitle":
        {
          const key = "appTitle";
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
    }
  },
});
