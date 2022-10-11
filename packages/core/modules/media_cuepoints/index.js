import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import MediaPlayer from "@metascore-library/core/modules/media_player";
import * as Manager from "./services/cuepoints-manager";

export default class MediaCuepointsModule extends AbstractModule {
  static id = "media_cuepoints";

  static dependencies = [MediaPlayer];

  constructor() {
    super(arguments);

    this._globalCuepoint = null;

    this.setGlobalCuepoint = this.setGlobalCuepoint.bind(this);
    this.getGlobalCuepoint = this.getGlobalCuepoint.bind(this);

    Manager.init();
  }

  addCuepoint(options) {
    return Manager.addCuepoint(options);
  }

  removeCuepoint(options) {
    Manager.removeCuepoint(options);
  }

  getGlobalCuepoint() {
    return this._globalCuepoint;
  }

  setGlobalCuepoint(options) {
    if (this._globalCuepoint) {
      Manager.removeCuepoint(this._globalCuepoint);
    }

    this._globalCuepoint = Manager.addCuepoint(options);

    return this._globalCuepoint;
  }

  clearCuepoints() {
    Manager.clearCuepoints();
  }
}
