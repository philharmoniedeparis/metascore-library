import ComponentForm from "./components/ComponentForm";
import PlayerPreview from "../player_preview";

export default {
  name: "ComponentForm",
  dependencies: [PlayerPreview],
  install({ app }) {
    app.component("ComponentForm", ComponentForm);
  },
};
