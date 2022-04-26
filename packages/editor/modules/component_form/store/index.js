import { defineStore } from "pinia";

export default defineStore("component-form", {
  state: () => {
    return {
      configs: {
        colorSwatches: [],
      },
    };
  },
  actions: {
    configure(configs) {
      this.configs = {
        ...this.configs,
        ...configs,
      };
    },
  },
});
