import useStore from "./store";
import MediaPlayer from "./components/MediaPlayer";

export default {
  id: "media",
  install({ app }) {
    app.component("MediaPlayer", MediaPlayer);

    return {
      useStore,
    };
  },
};
