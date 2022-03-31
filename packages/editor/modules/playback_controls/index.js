import PlaybackController from "./components/PlaybackController";
import PlaybackTime from "./components/PlaybackTime";
import Media from "@metascore-library/player/modules/media";
import FormControls from "../form_controls";
import StyledButton from "@metascore-library/core/modules/styled_button";

export default {
  id: "playback_controls",
  dependencies: [Media, FormControls, StyledButton],
  install({ app }) {
    app.component("PlaybackController", PlaybackController);
    app.component("PlaybackTime", PlaybackTime);
  },
};
