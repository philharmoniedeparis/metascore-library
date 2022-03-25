import TimecodeInput from "./components/TimecodeInput";
import StyledButton from "@metascore-library/core/modules/styled_button";

export default {
  id: "timecode_input",
  dependencies: [StyledButton],
  install({ app }) {
    app.component("TimecodeInput", TimecodeInput);
  },
};
