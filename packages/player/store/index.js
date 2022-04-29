import { defineStore } from "pinia";
import { useModule } from "@metascore-library/core/services/module-manager";
import * as api from "../api";

export default defineStore("player", {
  state: () => {
    return {
      loading: false,
    };
  },
  actions: {
    setData(data) {
      const mediaStore = useModule("media_player").store;
      mediaStore.source = data.media;

      const componentsStore = useModule("app_components").store;
      componentsStore.init(data.components);

      const appRendererStore = useModule("app_renderer").store;
      appRendererStore.width = data.width;
      appRendererStore.height = data.height;
      appRendererStore.css = data.css;
    },
    async load(url) {
      this.loading = true;

      const data = await api.get(url);
      this.setData(data);

      this.loading = false;
    },
  },
});
