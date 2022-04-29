import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import ContextMenu from "@metascore-library/core/modules/contextmenu";
import Modal from "@metascore-library/core/modules/modal";
import StyledButton from "@metascore-library/core/modules/styled_button";
import ScenarioManager from "./components/ScenarioManager";

export default class ScenarioManagerModule extends AbstractModule {
  static id = "scenario_manager";

  static dependencies = [ContextMenu, Modal, StyledButton];

  constructor({ app }) {
    super(arguments);

    app.component("ScenarioManager", ScenarioManager);
  }
}
