import PlaybackController from "./components/PlaybackController";
import PlaybackTime from "./components/PlaybackTime";

export default {
  name: "PlaybackControls",
  async install({ app }) {
    app.component("PlaybackController", PlaybackController);
    app.component("PlaybackTime", PlaybackTime);
  },
};
