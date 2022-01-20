import ComponentForm from "./components/ComponentForm";
import PlayerPreview from "../player_preview";
import Tabs from "../tabs";

export default {
  name: "ComponentForm",
  dependencies: [PlayerPreview, Tabs],
  install({ app }) {
    app.component("ComponentForm", ComponentForm);
  },
};
