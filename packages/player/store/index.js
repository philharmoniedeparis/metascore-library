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
    async setData(data) {
      const { setSource: setMediaSource } = useModule("media_player");
      setMediaSource(data.media);

      const { init: initComponents } = useModule("app_components");
      initComponents(data.components);

      const { init: initBehaviors, enable: enableBehaviors } =
        useModule("app_behaviors");
      await initBehaviors(data.behaviors);
      enableBehaviors();

      const { width, height, css } = data;
      const { init: initAppRenderer } = useModule("app_renderer");
      initAppRenderer({ width, height, css });
    },
    async load(url) {
      this.loading = true;

      const data = await api.load(url);
      await this.setData(data);

      this.loading = false;
    },
  },
});
