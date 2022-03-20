import ScenarioManager from "./components/ScenarioManager";

export default {
  id: "scenario_manager",
  install({ app }) {
    app.component("ScenarioManager", ScenarioManager);
  },
};
