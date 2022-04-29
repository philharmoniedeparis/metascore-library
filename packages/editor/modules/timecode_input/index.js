import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import TimecodeInput from "./components/TimecodeInput";
import StyledButton from "@metascore-library/core/modules/styled_button";

export default class TimecodeInputModule extends AbstractModule {
  static id = "timecode_input";

  static dependencies = [StyledButton];

  constructor({ app }) {
    super(arguments);

    app.component("TimecodeInput", TimecodeInput);
  }
}
