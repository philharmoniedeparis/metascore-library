import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import useStore from "./store";
import Ajax from "@metascore-library/core/modules/ajax";
import StyledButton from "@metascore-library/core/modules/styled_button";
import MediaPlayer from "@metascore-library/core/modules/media_player";
import WaveformOverview from "./components/WaveformOverview";
import WaveformZoom from "./components/WaveformZoom";
import WaveformZoomController from "./components/WaveformZoomController";

export default class WaveformModule extends AbstractModule {
  static id = "waveform";

  static dependencies = [Ajax, MediaPlayer, StyledButton];

  constructor({ app }) {
    super(arguments);

    app.component("WaveformOverview", WaveformOverview);
    app.component("WaveformZoom", WaveformZoom);
    app.component("WaveformZoomController", WaveformZoomController);
  }

  get store() {
    return useStore();
  }
}
