import WaveformOverview from "./components/WaveformOverview";
import WaveformZoom from "./components/WaveformZoom";
import WaveformZoomController from "./components/WaveformZoomController";
import moduleStore from "./store";

export default {
  name: "Waveform",
  async dependencies() {
    const { default: Media } = await import(
      /* webpackChunkName: "Editor.PlayerPreview" */ "@metascore-library/player/modules/media"
    );

    return [Media];
  },
  async install({ app, store }) {
    app.component("WaveformOverview", WaveformOverview);
    app.component("WaveformZoom", WaveformZoom);
    app.component("WaveformZoomController", WaveformZoomController);

    store.registerModule("waveform", moduleStore);
  },
};
