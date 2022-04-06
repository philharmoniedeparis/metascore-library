import PlaybackController from "./components/PlaybackController";
import PlaybackTime from "./components/PlaybackTime";
import MediaPlayer from "@metascore-library/core/modules/media_player";
import FormControls from "../form_controls";
import StyledButton from "@metascore-library/core/modules/styled_button";

export default {
  id: "playback_controls",
  dependencies: [MediaPlayer, FormControls, StyledButton],
  install({ app }) {
    app.component("PlaybackController", PlaybackController);
    app.component("PlaybackTime", PlaybackTime);
  },
};
