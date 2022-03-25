import useStore from "./store";
import StyledButton from "@metascore-library/core/modules/styled_button";
import Media from "@metascore-library/player/modules/media";
import WaveformOverview from "./components/WaveformOverview";
import WaveformZoom from "./components/WaveformZoom";
import WaveformZoomController from "./components/WaveformZoomController";

export default {
  id: "waveform",
  dependencies: [Media, StyledButton],
  install({ app }) {
    app.component("WaveformOverview", WaveformOverview);
    app.component("WaveformZoom", WaveformZoom);
    app.component("WaveformZoomController", WaveformZoomController);

    return {
      useStore,
    };
  },
};
