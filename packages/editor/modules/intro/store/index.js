import { defineStore } from "pinia";
import * as api from "../api";

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
    setDontShowAgain() {
      if (this.configs.dontShowAgainUrl) {
        try {
          api.setDontShowAgain(this.configs.dontShowAgainUrl);
        } catch (e) {
          // @todo: handle.
          console.error(e);
        }
      }
    },
  },
});