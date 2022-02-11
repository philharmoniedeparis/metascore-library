import PlayerPreview from "./components/PlayerPreview";

export default {
  name: "PlayerPreview",
  async dependencies() {
    const { default: AppRenderer } = await import(
      /* webpackChunkName: "Editor.PlayerPreview" */ "@metascore-library/player/modules/app_renderer"
    );

    return [AppRenderer];
  },
  async install({ app }) {
    const { default: ComponentWrapper } = await import(
      /* webpackChunkName: "Editor.PlayerPreview" */ "./components/ComponentWrapper"
    );
    app.component("ComponentWrapper", ComponentWrapper);

    app.component("PlayerPreview", PlayerPreview);
  },
};
