import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import useStore from "./store";
import MediaPlayer from "@metascore-library/core/modules/media_player";
import AppComponents from "@metascore-library/core/modules/app_components";
import MediaCuepoints from "../media_cuepoints";
import AppRenderer from "./components/AppRenderer.vue";

export default class AppRendererModule extends AbstractModule {
  static id = "app_renderer";

  static dependencies = [MediaPlayer, MediaCuepoints, AppComponents];

  constructor({ app }) {
    super(arguments);

    app.component("AppRenderer", AppRenderer);
  }

  get store() {
    return useStore();
  }
}
