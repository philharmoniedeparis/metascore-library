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
      const mediaStore = useModule("media_player").useStore();
      const componentsStore = useModule("app_components").useStore();
      const appRendererStore = useModule("app_renderer").useStore();

      const data = await api.get(url);

      mediaStore.source = data.media;

      componentsStore.init(data.components);

      appRendererStore.width = data.width;
      appRendererStore.height = data.height;
      appRendererStore.css = data.css;

      this.ready = true;
    },
  },
});
