import { defineStore } from "pinia";
import { load } from "@metascore-library/core/utils/ajax";
import { useModule } from "@metascore-library/core/services/module-manager";

export default defineStore("player", {
  state: () => {
    return {
      ready: false,
    };
  },
  actions: {
    async load(url) {
      const mediaStore = useModule("media").useStore();
      const componentsStore = useModule("app_components").useStore();
      const appRendererStore = useModule("app_renderer").useStore();

      const data = await load(url);

      mediaStore.setSource(data.media);

      componentsStore.init(data.components);

      appRendererStore.width = data.width;
      appRendererStore.height = data.height;
      appRendererStore.css = data.css;

      this.ready = true;
    },
  },
});
