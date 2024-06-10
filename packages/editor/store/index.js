import { defineStore } from "pinia";
import { unref } from "vue";
import { omit } from "lodash";
import { useModule } from "@metascore-library/core/services/module-manager";
import { t } from "@metascore-library/core/services/i18n";
import * as api from "../api";

export default defineStore("editor", {
  state: () => {
    return {
      ready: false,
      loading: false,
      saving: false,
      appTitle: null,
      revisions: [],
      latestRevision: null,
      activeRevision: null,
      dirty: new Map(),
      loadingAutoSaveData: false,
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
        if (this.isDirty("title", since)) {
          data.set("title", this.appTitle);
        }
        if (this.isDirty("width", since)) {
          const width = unref(useModule("app_renderer").width);
          data.set("width", width);
        }
        if (this.isDirty("height", since)) {
          const height = unref(useModule("app_renderer").height);
          data.set("height", height);
        }
        if (this.isDirty("media", since)) {
          const mediaSource = unref(useModule("media_player").source);
          if ("file" in mediaSource) {
            data.set("files[media]", mediaSource.file);
          }
          data.set("media", JSON.stringify(omit(mediaSource, ["file"])));
        }
        if (this.isDirty("components", since)) {
          const { data: components } = useModule("app_components");
          data.set("components", JSON.stringify(components));
        }
        if (this.isDirty("behaviors", since)) {
          const { data: behaviors } = useModule("app_behaviors");
          data.set("behaviors", JSON.stringify(unref(behaviors)));
        }
        if (this.isDirty("assets", since)) {
          const assets = unref(useModule("assets_library").assets);
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

      const { init: initUserPreferences } = useModule("user_preferences");
      await initUserPreferences();

      this.setAppTitle(data.title);
      this.$onAction(({ name }) => {
        switch (name) {
          case "setAppTitle":
            this.setDirty("title");
            break;
        }
      });

      const { width, height, css } = data;
      const { init: initAppRenderer, onStoreAction: onAppRendererStoreAction } =
        useModule("app_renderer");
      initAppRenderer({ width, height, css });
      onAppRendererStoreAction(({ name }) => {
        switch (name) {
          case "setWidth":
            this.setDirty("width");
            break;
          case "setHeight":
            this.setDirty("height");
            break;
        }
      });

      const { setSource: setMediaSource, onStoreAction: onMediaStoreAction } =
        useModule("media_player");
      setMediaSource(data.media);
      onMediaStoreAction(({ name }) => {
        if (["setSource"].includes(name)) {
          this.setDirty("media");
        }
      });

      const {
        init: initComponents,
        enableOverrides: enableComponentsOverrides,
        onStoreAction: onComponentsStoreAction,
      } = useModule("app_components");

      let components = data.components;
      if (!Array.isArray(components) || components.length < 1) {
        // Create an empty scenario.
        components = [
          {
            id: "scenario-1",
            type: "Scenario",
            name: t("scenario_default_title"),
          },
        ];
      }
      await initComponents(components);
      enableComponentsOverrides();
      onComponentsStoreAction(({ name }) => {
        if (["setScenarioIndex", "add", "update", "delete"].includes(name)) {
          this.setDirty("components");
        }
      });

      const { init: initBehaviors, onStoreAction: onBehaviorsStoreAction } =
        useModule("app_behaviors");
      await initBehaviors(data.behaviors);
      onBehaviorsStoreAction(({ name }) => {
        if (name === "update") {
          this.setDirty("behaviors");
        }
      });

      const { init: initAssets, onStoreAction: onAssetsStoreAction } =
        useModule("assets_library");
      initAssets(data.assets);
      onAssetsStoreAction(({ name }) => {
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
      this.ready = false;
      this.loading = true;

      try {
        const data = await api.load(url);
        await this.setData(data);

        const { clear: clearHistory } = useModule("history");
        clearHistory();
        this.dirty.clear();

        this.ready = true;
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
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
    async restoreAutoSaveData() {
      this.loading = true;

      const { load: loadAutoSaveData } = useModule("auto_save");
      const data = await loadAutoSaveData();

      await this.setData(data);

      this.loading = false;
    },
    deleteAutoSaveData() {
      const { delete: deleteAutoSaveData } = useModule("auto_save");
      deleteAutoSaveData();
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
