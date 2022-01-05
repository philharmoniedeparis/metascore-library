import AppRenderer from "./components/AppRenderer.vue";
import MediaPlayer from "../media_player";
import Components from "../components";

export default {
  name: "AppRenderer",
  dependencies: [MediaPlayer, Components],
  install({ app }) {
    app.component("app-renderer", AppRenderer);
  },
};
