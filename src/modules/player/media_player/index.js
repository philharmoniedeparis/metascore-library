import MediaPlayer from "./components/MediaPlayer";
import moduleStore from "./store";

export default {
  name: "MediaPlayer",
  install({ app, store }) {
    app.component("MediaPlayer", MediaPlayer);

    store.registerModule("media", moduleStore);
  },
};
