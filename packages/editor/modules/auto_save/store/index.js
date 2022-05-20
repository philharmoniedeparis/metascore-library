import { defineStore } from "pinia";
import useEditorStore from "@metascore-library/editor/store";
import * as api from "../api";

export default defineStore("auto-save", {
  state: () => {
    return {
      configs: {
        url: null,
        interval: 30,
        deleteOnUnload: true,
      },
      saving: false,
      lastSave: null,
      timeoutId: null,
      storeUnsubscribeCallback: null,
    };
  },
  actions: {
    configure(configs) {
      this.configs = {
        ...this.configs,
        ...configs,
      };
    },
    setTimeout() {
      this.timeoutId = setTimeout(this.save, this.configs.interval * 1000);
    },
    subscribe() {
      if (!this.configs.url) {
        return;
      }

      const editorStore = useEditorStore();
      this.storeUnsubscribeCallback = editorStore.$onAction(({ name }) => {
        if (!this.timeoutId && name === "setDirty") {
          this.setTimeout();
        }
      });

      if (this.configs.deleteOnUnload) {
        //window.addEventListener("unload", this.delete);
      }
    },
    unsubscribe() {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
      if (this.storeUnsubscribeCallback) {
        this.storeUnsubscribeCallback();
        this.storeUnsubscribeCallback = null;
      }
    },
    isDataAvailable() {
      return api
        .head(this.configs.url)
        .then(() => true)
        .catch(() => false);
    },
    load() {
      return api.load(this.configs.url);
    },
    save() {
      this.saving = true;

      const editorStore = useEditorStore();

      return api
        .save(this.configs.url, editorStore.getDirtyData(this.lastSave))
        .then(() => {
          this.lastSave = Date.now();
        })
        .catch(() => {
          this.setTimeout();
        })
        .finally(() => {
          this.saving = false;
          this.timeoutId = null;
        });
    },
    delete() {
      return api.delete(this.configs.url);
    },
  },
});
