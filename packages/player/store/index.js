import { defineStore } from "pinia";
import { useModule } from "@metascore-library/core/services/module-manager";
import * as api from "../api";

export default defineStore("player", {
  state: () => {
    return {
      ready: false,
    };
  },
  actions: {
    async load(url) {
      const data = await api.get(url);

      const mediaStore = useModule("media_player").useStore();
      mediaStore.source = data.media;

      const componentsStore = useModule("app_components").useStore();
      componentsStore.init(data.components);

      const appRendererStore = useModule("app_renderer").useStore();
      appRendererStore.width = data.width;
      appRendererStore.height = data.height;
      appRendererStore.css = data.css;

      this.ready = true;
    },
  },
});
