import ComponentForm from "./components/ComponentForm";
import PlayerPreview from "../player_preview";
import Tabs from "../tabs";
import TimecodeInput from "../timecode_input";

export default {
  name: "ComponentForm",
  dependencies: [PlayerPreview, Tabs, TimecodeInput],
  install({ app }) {
    app.component("ComponentForm", ComponentForm);
  },
};
