import AbstractModule, { type Context } from "@core/services/module-manager/AbstractModule";
import MediaPlayer from "@core/modules/media_player";
import * as Manager from "./services/cuepoints-manager";

export default class MediaCuepointsModule extends AbstractModule {
  static id = "core:media_cuepoints";

  static dependencies = [MediaPlayer];

  #globalCuepoint: Manager.CuePoint|null = null

  constructor(context: Context) {
    super(context);

    this.setGlobalCuepoint = this.setGlobalCuepoint.bind(this);
    this.getGlobalCuepoint = this.getGlobalCuepoint.bind(this);

    Manager.init();
  }

  addCuepoint(options: Manager.CuePointOptions) {
    return Manager.addCuepoint(options);
  }

  removeCuepoint(cuepoint: Manager.CuePoint) {
    Manager.removeCuepoint(cuepoint);
  }

  getGlobalCuepoint() {
    return this.#globalCuepoint;
  }

  setGlobalCuepoint(options: Manager.CuePointOptions) {
    if (this.#globalCuepoint) {
      Manager.removeCuepoint(this.#globalCuepoint);
    }

    this.#globalCuepoint = Manager.addCuepoint(options);

    return this.#globalCuepoint;
  }

  clearCuepoints() {
    Manager.clearCuepoints();
  }
}
