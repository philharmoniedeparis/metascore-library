import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import ComponentIcons from "../component_icons";
import ContextMenu from "@metascore-library/core/modules/contextmenu";
import History from "../history";
import AppPreview from "../app_preview";
import ComponentsTimeline from "./components/ComponentsTimeline";

export default class TimelineModule extends AbstractModule {
  static id = "timeline";

  static dependencies = [ComponentIcons, ContextMenu, History, AppPreview];

  constructor({ app }) {
    super(arguments);

    app.component("ComponentsTimeline", ComponentsTimeline);
  }
}
