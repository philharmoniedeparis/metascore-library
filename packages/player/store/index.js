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
      const { setSource: setMediaSource } = useModule("media_player");
      setMediaSource(data.media);

      const { init: initComponents } = useModule("app_components");
      initComponents(data.components);

      const { width, height, css } = data;
      const { init: initAppRenderer } = useModule("app_renderer");
      initAppRenderer({ width, height, css });
    },
    async load(url) {
      this.loading = true;

      const data = await api.get(url);
      this.setData(data);

      this.loading = false;
    },
  },
});
