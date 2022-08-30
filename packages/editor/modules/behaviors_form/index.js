import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";

import AppBehaviors from "@metascore-library/core/modules/app_behaviors";
import AppComponents from "@metascore-library/core/modules/app_components";
import MediaPlayer from "@metascore-library/core/modules/media_player";
import BehaviorsForm from "./components/BehaviorsForm";

export default class BehaviorsFormModule extends AbstractModule {
  static id = "behaviors-form";

  static dependencies = [AppBehaviors, AppComponents, MediaPlayer];

  constructor({ app }) {
    super(arguments);

    app.component("BehaviorsForm", BehaviorsForm);
  }
}
