import AbstractModule, { type Context } from "@core/services/module-manager/AbstractModule";
import MediaPlayer from "@core/modules/media_player";
import * as Manager from "./services/cuepoints-manager";

export default class MediaCuepointsModule extends AbstractModule {
  static id = "media_cuepoints";

  static dependencies = [MediaPlayer];

  _globalCuepoint: Manager.CuePoint|null = null

  constructor(context: Context) {
    super(context);

    this.setGlobalCuepoint = this.setGlobalCuepoint.bind(this);
    this.getGlobalCuepoint = this.getGlobalCuepoint.bind(this);

    Manager.init();
  }

  addCuepoint(options: Manager.CuePointOptions) {
    return Manager.addCuepoint(options);
  }

  removeCuepoint(options: Manager.CuePoint) {
    Manager.removeCuepoint(options);
  }

  getGlobalCuepoint() {
    return this._globalCuepoint;
  }

  setGlobalCuepoint(options: Manager.CuePointOptions) {
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
