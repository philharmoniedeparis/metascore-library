import MainMenu from "./components/MainMenu.vue";

import PlayerPreview from "../player_preview";
import History from "../history";
import RevisionsManager from "../revisions_manager";

export default {
  name: "MainMenu",
  dependencies: [PlayerPreview, History, RevisionsManager],
  install({ app }) {
    app.component("MainMenu", MainMenu);
  },
};
