import MediaPlayer from "../media_player";
import AppComponents from "../app_components";
import PostMessage from "../post_message";
import AppRenderer from "./components/AppRenderer.vue";
import moduleStore from "./store";

export default {
  name: "AppRenderer",
  dependencies: [MediaPlayer, AppComponents, PostMessage],
  install({ app, store }) {
    app.component("AppRenderer", AppRenderer);

    store.registerModule("app-renderer", moduleStore);
  },
};
