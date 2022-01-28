import WaveformOverview from "./components/WaveformOverview";
import WaveformZoom from "./components/WaveformZoom";

export default {
  name: "Waveform",
  async install({ app }) {
    app.component("WaveformOverview", WaveformOverview);
    app.component("WaveformZoom", WaveformZoom);
  },
};
