import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import BaseButton from "@metascore-library/core/modules/button";
import ContextMenu from "@metascore-library/core/modules/contextmenu";
import Confirm from "../confirm";
import ModalForm from "../modal_form";
import ScenarioManager from "./components/ScenarioManager";

export default class ScenarioManagerModule extends AbstractModule {
  static id = "scenario_manager";

  static dependencies = [ContextMenu, Confirm, ModalForm, BaseButton];

  constructor({ app }) {
    super(arguments);

    app.component("ScenarioManager", ScenarioManager);
  }
}
