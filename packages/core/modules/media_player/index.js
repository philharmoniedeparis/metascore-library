import useStore from "./store";
import MediaPlayer from "./components/MediaPlayer";

export default {
  id: "media_player",
  install({ app }) {
    app.component("MediaPlayer", MediaPlayer);

    return {
      useStore,
    };
  },
};
