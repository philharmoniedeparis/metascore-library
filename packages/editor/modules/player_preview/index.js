import { useModule } from "@metascore-library/core/services/module-manager";
import useStore from "./store";
import AppComponents from "@metascore-library/player/modules/app_components";
import AppRenderer from "@metascore-library/player/modules/app_renderer";
import ContextMenu from "@metascore-library/core/modules/contextmenu";
import Clipboard from "../clipboard";
import FormControls from "../form_controls";
import History from "../history";

import PlayerPreview from "./components/PlayerPreview";
import PlayerZoomController from "./components/PlayerZoomController";
import PlayerDimensionsController from "./components/PlayerDimensionsController";
import PlayerPreviewToggler from "./components/PlayerPreviewToggler";
import ComponentWrapper from "./components/ComponentWrapper";

export default {
  id: "player_preview",
  dependencies: [
    AppComponents,
    AppRenderer,
    ContextMenu,
    Clipboard,
    FormControls,
    History,
  ],
  install({ app }) {
    const PlayerComponentWrapper = useModule("app_components").ComponentWrapper;

    // Override the player's component-wrapper.
    app.component("ComponentWrapper", ComponentWrapper);
    app.component("PlayerComponentWrapper", PlayerComponentWrapper);

    app.component("PlayerPreview", PlayerPreview);
    app.component("PlayerZoomController", PlayerZoomController);
    app.component("PlayerDimensionsController", PlayerDimensionsController);
    app.component("PlayerPreviewToggler", PlayerPreviewToggler);

    return {
      useStore,
    };
  },
};
