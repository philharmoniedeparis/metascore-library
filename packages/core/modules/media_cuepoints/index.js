import MediaPlayer from "@metascore-library/core/modules/media_player";
import {
  init,
  addCuepoint,
  clearCuepoints,
} from "./services/cuepoints-manager";

export default {
  id: "media_cuepoints",
  dependencies: [MediaPlayer],
  install() {
    init();

    return {
      addCuepoint,
      clearCuepoints,
    };
  },
};
