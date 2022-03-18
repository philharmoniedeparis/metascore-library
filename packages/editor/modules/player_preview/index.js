import useStore from "./store";
import ContextMenu from "@metascore-library/core/modules/contextmenu";
import Clipboard from "../clipboard";
import FormControls from "../form_controls";
import PlayerPreview from "./components/PlayerPreview";
import PlayerZoomController from "./components/PlayerZoomController";
import PlayerDimensionsController from "./components/PlayerDimensionsController";
import PlayerPreviewToggler from "./components/PlayerPreviewToggler";

export default {
  name: "PlayerPreview",
  async dependencies() {
    const { default: AppRenderer } = await import(
      /* webpackChunkName: "Editor.PlayerPreview" */ "@metascore-library/player/modules/app_renderer"
    );

    return [ContextMenu, Clipboard, FormControls, AppRenderer];
  },
  async install({ app }) {
    const { default: ComponentWrapper } = await import(
      /* webpackChunkName: "Editor.PlayerPreview" */ "./components/ComponentWrapper"
    );
    // Override the player's component-wrapper.
    app.component("ComponentWrapper", ComponentWrapper);

    app.component("PlayerPreview", PlayerPreview);
    app.component("PlayerZoomController", PlayerZoomController);
    app.component("PlayerDimensionsController", PlayerDimensionsController);
    app.component("PlayerPreviewToggler", PlayerPreviewToggler);

    return {
      useStore,
    };
  },
};
