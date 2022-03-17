import PlaybackController from "./components/PlaybackController";
import PlaybackTime from "./components/PlaybackTime";
import Media from "@metascore-library/player/modules/media";
import FormControls from "../form_controls";

export default {
  name: "PlaybackControls",
  dependencies: [Media, FormControls],
  install({ app }) {
    app.component("PlaybackController", PlaybackController);
    app.component("PlaybackTime", PlaybackTime);
  },
};
