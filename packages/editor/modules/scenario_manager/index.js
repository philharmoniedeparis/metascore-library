import Modal from "@metascore-library/core/modules/modal";
import StyledButton from "@metascore-library/core/modules/styled_button";
import ScenarioManager from "./components/ScenarioManager";

export default {
  id: "scenario_manager",
  dependencies: [Modal, StyledButton],
  install({ app }) {
    app.component("ScenarioManager", ScenarioManager);
  },
};
