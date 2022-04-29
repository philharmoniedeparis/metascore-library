import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import useStore from "./store";
import MediaPlayer from "./components/MediaPlayer";

export default class MediaPlayerModule extends AbstractModule {
  static id = "media_player";

  constructor({ app }) {
    super(arguments);

    app.component("MediaPlayer", MediaPlayer);
  }

  get store() {
    return useStore();
  }
}
