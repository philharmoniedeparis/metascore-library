import useStore from "./store";
import MediaPlayer from "@metascore-library/core/modules/media_player";
import AppComponents from "@metascore-library/core/modules/app_components";
import MediaCuepoints from "../media_cuepoints";
import AppRenderer from "./components/AppRenderer.vue";

export default {
  id: "app_renderer",
  dependencies: [MediaPlayer, MediaCuepoints, AppComponents],
  install({ app }) {
    app.component("AppRenderer", AppRenderer);

    return {
      useStore,
    };
  },
};
