import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import AppComponents from "@metascore-library/core/modules/app_components";
import Confirm from "@metascore-library/core/modules/confirm";
import ContextMenu from "@metascore-library/core/modules/contextmenu";
import BaseButton from "@metascore-library/core/modules/button";
import ScenarioManager from "./components/ScenarioManager";

export default class ScenarioManagerModule extends AbstractModule {
  static id = "scenario_manager";

  static dependencies = [AppComponents, Confirm, ContextMenu, BaseButton];

  constructor({ app }) {
    super(arguments);

    app.component("ScenarioManager", ScenarioManager);
  }
}
