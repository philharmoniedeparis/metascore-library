import useStore from "./store";
import MediaPlayer from "@metascore-library/core/modules/media_player";
import AppComponents from "@metascore-library/core/modules/app_components";
import AppRenderer from "./components/AppRenderer.vue";

export default {
  id: "app_renderer",
  dependencies: [MediaPlayer, AppComponents],
  install({ app }) {
    app.component("AppRenderer", AppRenderer);

    return {
      useStore,
    };
  },
};
