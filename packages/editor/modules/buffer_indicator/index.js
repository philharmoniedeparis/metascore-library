import MediaPlayer from "@metascore-library/core/modules/media_player";
import BufferIndicator from "./components/BufferIndicator";

export default {
  id: "buffer_indicator",
  dependencies: [MediaPlayer],
  install({ app }) {
    app.component("BufferIndicator", BufferIndicator);
  },
};
