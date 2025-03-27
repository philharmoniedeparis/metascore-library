import { defineStore } from "pinia";
import { useModule } from "@core/services/module-manager";
import * as api from "../api";

export default defineStore("player", {
  state: () => {
    return {
      ready: false,
      loading: false,
    };
  },
  actions: {
    async setData(data) {
      const { setSource: setMediaSource } = useModule("core:media_player");
      setMediaSource(data.media);

      const {
        init: initComponents,
        enableOverrides: enableComponentsOverrides,
      } = useModule("core:app_components");
      await initComponents(data.components);
      enableComponentsOverrides();

      const { init: initBehaviors, enable: enableBehaviors } =
        useModule("core:app_behaviors");
      await initBehaviors(data.behaviors);
      enableBehaviors();

      const { width, height, css } = data;
      const { init: initAppRenderer } = useModule("core:app_renderer");
      initAppRenderer({ width, height, css });
    },
    async load(url) {
      this.ready = false;
      this.loading = true;

      try {
        const data = await api.load(url);
        await this.setData(data);
        this.ready = true;
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
  },
});
