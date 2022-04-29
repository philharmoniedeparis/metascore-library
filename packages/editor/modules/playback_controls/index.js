import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import PlaybackController from "./components/PlaybackController";
import PlaybackTime from "./components/PlaybackTime";
import MediaPlayer from "@metascore-library/core/modules/media_player";
import FormControls from "../form_controls";
import StyledButton from "@metascore-library/core/modules/styled_button";

export default class PlaybackControlsModule extends AbstractModule {
  static id = "playback_controls";

  static dependencies = [MediaPlayer, FormControls, StyledButton];

  constructor({ app }) {
    super(arguments);

    app.component("PlaybackController", PlaybackController);
    app.component("PlaybackTime", PlaybackTime);
  }
}
