import ContextMenu from "@metascore-library/core/modules/contextmenu";
import Modal from "@metascore-library/core/modules/modal";
import StyledButton from "@metascore-library/core/modules/styled_button";
import ScenarioManager from "./components/ScenarioManager";

export default {
  id: "scenario_manager",
  dependencies: [ContextMenu, Modal, StyledButton],
  install({ app }) {
    app.component("ScenarioManager", ScenarioManager);
  },
};
