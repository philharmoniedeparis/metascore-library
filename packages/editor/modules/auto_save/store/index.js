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
      this.storeUnsubscribe = editorStore.$onAction(({ name }) => {
        if (!this.timeoutId && name === "setDirty") {
          this.setTimeout();
        }
      });

      if (this.configs.deleteOnUnload) {
        window.addEventListener("unload", this.delete);
      }
    },
    unsubscribe() {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }
      if (this.storeUnsubscribe) {
        this.storeUnsubscribe();
      }
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
