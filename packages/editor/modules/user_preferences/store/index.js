import { defineStore } from "pinia";
import * as api from "../api";

export default defineStore("user-preferences", {
  state: () => {
    return {
      configs: {
        url: null,
      },
      data: {},
      loaded: false,
      loading: false,
      saving: false,
    };
  },
  actions: {
    configure(configs) {
      this.configs = {
        ...this.configs,
        ...configs,
      };
    },
    async init() {
      if (this.loaded || this.loading) return;

      this.loading = true;

      // @todo: handle errors.
      try {
        this.data = await api.load(this.configs.url);
      } catch (e) {
        console.error(e);
      }

      this.loaded = true;
      this.loading = false;
    },
    async save() {
      this.saving = true;

      return await api.save(this.configs.url, this.data).finally(() => {
        this.saving = false;
      });
    },
  },
});
