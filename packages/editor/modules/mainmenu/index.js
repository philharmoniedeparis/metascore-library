import MainMenu from "./components/MainMenu.vue";

import PlayerZoom from "../player_zoom";
import History from "../history";
import RevisionsManager from "../revisions_manager";

export default {
  name: "MainMenu",
  dependencies: [PlayerZoom, History, RevisionsManager],
  install({ app }) {
    app.component("MainMenu", MainMenu);
  },
};
