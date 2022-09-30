import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import * as messageHandler from "./services/message-handler";
import MediaPlayer from "@metascore-library/core/modules/media_player";
import MediaCuepoints from "@metascore-library/core/modules//media_cuepoints";
import AppComponents from "@metascore-library/core/modules/app_components";

export default class ApiModule extends AbstractModule {
  static id = "api";

  static dependencies = [MediaPlayer, MediaCuepoints, AppComponents];

  constructor() {
    super();

    window.addEventListener("message", (evt) => {
      messageHandler.processMessage(evt);
    });
  }
}
