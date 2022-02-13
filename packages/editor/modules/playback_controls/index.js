import PlaybackController from "./components/PlaybackController";
import PlaybackTime from "./components/PlaybackTime";
import Media from "@metascore-library/player/modules/media";
import TimecodeInput from "../timecode_input";

export default {
  name: "PlaybackControls",
  dependencies: [Media, TimecodeInput],
  async install({ app }) {
    app.component("PlaybackController", PlaybackController);
    app.component("PlaybackTime", PlaybackTime);
  },
};
