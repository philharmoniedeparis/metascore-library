import BufferIndicator from "./components/BufferIndicator";

export default {
  id: "buffer_indicator",
  async dependencies() {
    const { default: Media } = await import(
      /* webpackChunkName: "Editor.PlayerPreview" */ "@metascore-library/player/modules/media"
    );

    return [Media];
  },
  install({ app }) {
    app.component("BufferIndicator", BufferIndicator);
  },
};
