import useStore from "./store";
import MediaPlayer from "./components/MediaPlayer";

export default {
  name: "Media",
  install({ app }) {
    app.component("MediaPlayer", MediaPlayer);

    return {
      useStore,
    };
  },
};
