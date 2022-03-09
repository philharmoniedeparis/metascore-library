import store from "./store";
import StyledButton from "@metascore-library/core/modules/styled_button";
import WaveformOverview from "./components/WaveformOverview";
import WaveformZoom from "./components/WaveformZoom";
import WaveformZoomController from "./components/WaveformZoomController";

export default {
  name: "Waveform",
  async dependencies() {
    const { default: Media } = await import(
      /* webpackChunkName: "Editor.PlayerPreview" */ "@metascore-library/player/modules/media"
    );

    return [Media, StyledButton];
  },
  stores: {
    waveform: store,
  },
  install({ app }) {
    app.component("WaveformOverview", WaveformOverview);
    app.component("WaveformZoom", WaveformZoom);
    app.component("WaveformZoomController", WaveformZoomController);
  },
};
