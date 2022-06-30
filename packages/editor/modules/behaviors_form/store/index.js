import { defineStore } from "pinia";

export default defineStore("behaviors-form", {
  state: () => {
    return {
      configs: {},
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
