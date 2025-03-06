import AbstractModule from "@core/services/module-manager/AbstractModule";
import * as messageHandler from "./services/message-handler";
import MediaPlayer from "@core/modules/media_player";
import MediaCuepoints from "@core/modules//media_cuepoints";
import AppComponents from "@core/modules/app_components";

export default class ApiModule extends AbstractModule {
  static id = "player:api";

  static dependencies = [MediaPlayer, MediaCuepoints, AppComponents];

  constructor() {
    super();

    window.addEventListener("message", (evt) => {
      messageHandler.processMessage(evt);
    });
  }
}
