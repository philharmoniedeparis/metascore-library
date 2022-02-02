import PlaybackController from "./components/PlaybackController";
import PlaybackTime from "./components/PlaybackTime";
import MediaPlayer from "../../player/media_player";
import TimecodeInput from "../timecode_input";

export default {
  name: "PlaybackControls",
  dependencies: [MediaPlayer, TimecodeInput],
  async install({ app }) {
    app.component("PlaybackController", PlaybackController);
    app.component("PlaybackTime", PlaybackTime);
  },
};
