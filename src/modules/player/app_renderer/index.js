import MediaPlayer from "../media_player";
import Components from "../components";
import PostMessage from "../post_message";
import AppRenderer from "./components/AppRenderer.vue";
import moduleStore from "./store";

export default {
  name: "AppRenderer",
  dependencies: [MediaPlayer, Components, PostMessage],
  install({ app, store }) {
    app.component("app-renderer", AppRenderer);

    store.registerModule("app-renderer", moduleStore);
  },
};
