import { defineStore } from "pinia";

export default defineStore("component-form", {
  state: () => {
    return {
      configs: {
        colorSwatches: [],
      },
      recordingCursorKeyframes: false,
      editingTextContent: false,
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
