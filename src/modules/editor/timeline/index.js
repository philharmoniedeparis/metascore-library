import ComponentsTimeline from "./components/ComponentsTimeline";
import PlayerPreview from "../player_preview";
import ComponentIcons from "../component_icons";

export default {
  name: "Timeline",
  dependencies: [PlayerPreview, ComponentIcons],
  async install({ app }) {
    app.component("ComponentsTimeline", ComponentsTimeline);
  },
};
