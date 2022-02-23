import store from "./store";
import MediaPlayer from "./components/MediaPlayer";

export default {
  name: "MediaPlayer",
  stores: {
    media: store,
  },
  install({ app }) {
    app.component("MediaPlayer", MediaPlayer);
  },
};
