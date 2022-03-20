import ComponentsTimeline from "./components/ComponentsTimeline";
import PlayerPreview from "../player_preview";
import ComponentIcons from "../component_icons";

export default {
  id: "timeline",
  dependencies: [PlayerPreview, ComponentIcons],
  install({ app }) {
    app.component("ComponentsTimeline", ComponentsTimeline);
  },
};
