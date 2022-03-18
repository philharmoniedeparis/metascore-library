import useStore from "./store";
import Media from "../media";
import AppComponents from "../app_components";
import PostMessage from "../post_message";
import AppRenderer from "./components/AppRenderer.vue";

export default {
  name: "AppRenderer",
  dependencies: [Media, AppComponents, PostMessage],
  install({ app }) {
    app.component("AppRenderer", AppRenderer);

    return {
      useStore,
    };
  },
};
