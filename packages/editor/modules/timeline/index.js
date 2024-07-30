import AbstractModule from "@core/services/module-manager/AbstractModule";
import AppComponents from "@core/modules/app_components";
import ContextMenu from "@core/modules/contextmenu";
import History from "../history";
import Hotkey from "../hotkey";
import AppPreview from "../app_preview";
import ComponentsTimeline from "./components/ComponentsTimeline";

export default class TimelineModule extends AbstractModule {
  static id = "timeline";

  static dependencies = [
    AppComponents,
    ContextMenu,
    History,
    Hotkey,
    AppPreview,
  ];

  constructor({ app }) {
    super(arguments);

    app.component("ComponentsTimeline", ComponentsTimeline);
  }
}
