import BufferIndicator from "./components/BufferIndicator";

export default {
  name: "BufferIndicator",
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
