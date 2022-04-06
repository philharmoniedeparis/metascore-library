import useStore from "./store";
import StyledButton from "@metascore-library/core/modules/styled_button";
import MediaPlayer from "@metascore-library/core/modules/media_player";
import WaveformOverview from "./components/WaveformOverview";
import WaveformZoom from "./components/WaveformZoom";
import WaveformZoomController from "./components/WaveformZoomController";

export default {
  id: "waveform",
  dependencies: [MediaPlayer, StyledButton],
  install({ app }) {
    app.component("WaveformOverview", WaveformOverview);
    app.component("WaveformZoom", WaveformZoom);
    app.component("WaveformZoomController", WaveformZoomController);

    return {
      useStore,
    };
  },
};
