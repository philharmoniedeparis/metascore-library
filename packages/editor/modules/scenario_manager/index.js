import ScenarioManager from "./components/ScenarioManager";

export default {
  name: "ScenarioManager",
  async install({ app }) {
    app.component("ScenarioManager", ScenarioManager);
  },
};
