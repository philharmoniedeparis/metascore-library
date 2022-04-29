import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import MediaPlayer from "@metascore-library/core/modules/media_player";
import * as Manager from "./services/cuepoints-manager";

export default class MediaCuepointsModule extends AbstractModule {
  static id = "media_cuepoints";

  static dependencies = [MediaPlayer];

  constructor() {
    super(arguments);

    Manager.init();
  }

  addCuepoint(options) {
    Manager.addCuepoint(options);
  }

  removeCuepoint(options) {
    Manager.removeCuepoint(options);
  }

  clearCuepoints() {
    Manager.clearCuepoints();
  }
}
