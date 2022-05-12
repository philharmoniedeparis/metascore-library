import { defineStore } from "pinia";
import { unref } from "vue";
import { omit } from "lodash";
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
      dirty: new Map(),
    };
  },
  getters: {
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
