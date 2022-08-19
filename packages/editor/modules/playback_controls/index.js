import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import PlaybackController from "./components/PlaybackController";
import PlaybackTime from "./components/PlaybackTime";
import MediaPlayer from "@metascore-library/core/modules/media_player";
import FormControls from "../form_controls";
import Hotkey from "../hotkey";
import BaseButton from "@metascore-library/core/modules/button";

export default class PlaybackControlsModule extends AbstractModule {
  static id = "playback_controls";

  static dependencies = [MediaPlayer, FormControls, Hotkey, BaseButton];

  constructor({ app }) {
    super(arguments);

    app.component("PlaybackController", PlaybackController);
    app.component("PlaybackTime", PlaybackTime);
  }
}
