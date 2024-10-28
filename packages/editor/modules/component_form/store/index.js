import { defineStore } from "pinia";
import { unref } from "vue";
import { useModule } from "@core/services/module-manager";

export default defineStore("component-form", {
  state: () => {
    return {
      configs: {
        colorSwatches: [],
        extraFonts: [],
      },
      title: null,
      recordingCursorKeyframes: false,
      editingTextContent: false,
    };
  },
  getters: {
    colorSwatches() {
      return this.configs.colorSwatches;
    },
    extraFonts() {
      const { fonts } = useModule("app_renderer");

      return [
        ...this.configs.extraFonts,
        ...unref(fonts).map((font) => font.family),
      ];
    },
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
