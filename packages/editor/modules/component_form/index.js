import StyledButton from "@metascore-library/core/modules/styled_button";
import FormGroup from "@metascore-library/core/modules/form_group";
import ComponentForm from "./components/ComponentForm";
import PlayerPreview from "../player_preview";
import Tabs from "../tabs";
import TimecodeInput from "../timecode_input";

export default {
  name: "ComponentForm",
  dependencies: [StyledButton, FormGroup, PlayerPreview, Tabs, TimecodeInput],
  install({ app }) {
    app.component("ComponentForm", ComponentForm);
  },
};
