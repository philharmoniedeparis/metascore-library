import { defineStore } from "pinia";

export default defineStore("intro", {
  state: () => {
    return {
      configs: {
        steps: [],
        dontShowAgainUrl: null,
        exitOnEsc: true,
        exitOnOverlyClick: true,
        keyboardNavigation: true,
        bullets: true,
        progress: false,
        overlayOpacity: 0.75,
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
