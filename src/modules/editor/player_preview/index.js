import PlayerPreview from "./components/PlayerPreview";

export default {
  name: "PlayerPreview",
  async dependencies() {
    const { default: AppRenderer } = await import(
      /* webpackChunkName: "Editor.PlayerPreviewIframe" */ "../../player/app_renderer"
    );

    return [AppRenderer];
  },
  install({ app }) {
    app.component("player-preview", PlayerPreview);
  },
};
