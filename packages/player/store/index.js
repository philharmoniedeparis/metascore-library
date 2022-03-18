import { defineStore } from "pinia";
import { load } from "@metascore-library/core/utils/ajax";
import { useModule } from "@metascore-library/core/services/module-manager";

export default defineStore("player", {
  actions: {
    async load(url) {
      const mediaStore = useModule("Media").useStore();
      const componentsStore = useModule("AppComponents").useStore();
      const appRendererStore = useModule("AppRenderer").useStore();

      const data = await load(url);

      mediaStore.source = data.media;

      componentsStore.init(data.components);

      appRendererStore.width = data.width;
      appRendererStore.height = data.height;
      appRendererStore.css = data.css;
      appRendererStore.ready = true;
    },
  },
});
