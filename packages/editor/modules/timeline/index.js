import ComponentIcons from "../component_icons";
import ContextMenu from "@metascore-library/core/modules/contextmenu";
import History from "../history";
import PlayerPreview from "../player_preview";
import ComponentsTimeline from "./components/ComponentsTimeline";

export default {
  id: "timeline",
  dependencies: [ComponentIcons, ContextMenu, History, PlayerPreview],
  install({ app }) {
    app.component("ComponentsTimeline", ComponentsTimeline);
  },
};
