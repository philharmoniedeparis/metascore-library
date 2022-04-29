import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import { useModule } from "@metascore-library/core/services/module-manager";
import useStore from "./store";
import AppComponents from "@metascore-library/core/modules/app_components";
import AppRenderer from "@metascore-library/core/modules/app_renderer";
import ContextMenu from "@metascore-library/core/modules/contextmenu";
import Clipboard from "../clipboard";
import FormControls from "../form_controls";
import History from "../history";

import AppPreview from "./components/AppPreview";
import AppZoomController from "./components/AppZoomController";
import AppDimensionsController from "./components/AppDimensionsController";
import AppPreviewToggler from "./components/AppPreviewToggler";
import ComponentWrapper from "./components/ComponentWrapper";

export default class AppPreviewModule extends AbstractModule {
  static id = "app_preview";

  static dependencies = [
    AppComponents,
    AppRenderer,
    ContextMenu,
    Clipboard,
    FormControls,
    History,
  ];

  constructor({ app }) {
    super(arguments);

    const DefaultComponentWrapper =
      useModule("app_components").components.ComponentWrapper;

    // Override the default component-wrapper.
    app.component("ComponentWrapper", ComponentWrapper);
    app.component("DefaultComponentWrapper", DefaultComponentWrapper);

    app.component("AppPreview", AppPreview);
    app.component("AppZoomController", AppZoomController);
    app.component("AppDimensionsController", AppDimensionsController);
    app.component("AppPreviewToggler", AppPreviewToggler);
  }

  get store() {
    return useStore();
  }
}
