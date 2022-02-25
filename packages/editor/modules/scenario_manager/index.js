import ScenarioManager from "./components/ScenarioManager";

export default {
  name: "ScenarioManager",
  install({ app }) {
    app.component("ScenarioManager", ScenarioManager);
  },
};
