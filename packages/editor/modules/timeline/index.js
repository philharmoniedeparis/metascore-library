import ComponentIcons from "../component_icons";
import ContextMenu from "@metascore-library/core/modules/contextmenu";
import History from "../history";
import AppPreview from "../app_preview";
import ComponentsTimeline from "./components/ComponentsTimeline";

export default {
  id: "timeline",
  dependencies: [ComponentIcons, ContextMenu, History, AppPreview],
  install({ app }) {
    app.component("ComponentsTimeline", ComponentsTimeline);
  },
};
