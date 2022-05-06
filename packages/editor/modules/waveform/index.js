import { readonly } from "vue";
import { storeToRefs } from "pinia";
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

  get minScale() {
    const store = useStore();
    const { minScale } = storeToRefs(store);
    return readonly(minScale);
  }

  get maxScale() {
    const store = useStore();
    const { maxScale } = storeToRefs(store);
    return readonly(maxScale);
  }

  get scale() {
    const store = useStore();
    const { scale } = storeToRefs(store);
    return readonly(scale);
  }

  get offset() {
    const store = useStore();
    const { offset } = storeToRefs(store);
    return readonly(offset);
  }

  load(source) {
    const store = useStore();
    return store.load(source);
  }
}
