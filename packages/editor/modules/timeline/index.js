import ComponentsTimeline from "./components/ComponentsTimeline";
import PlayerPreview from "../player_preview";
import ComponentIcons from "../component_icons";
import History from "../history";

export default {
  id: "timeline",
  dependencies: [PlayerPreview, ComponentIcons, History],
  install({ app }) {
    app.component("ComponentsTimeline", ComponentsTimeline);
  },
};
