import Media from "@metascore-library/player/modules/media";
import BufferIndicator from "./components/BufferIndicator";

export default {
  id: "buffer_indicator",
  dependencies: [Media],
  install({ app }) {
    app.component("BufferIndicator", BufferIndicator);
  },
};
