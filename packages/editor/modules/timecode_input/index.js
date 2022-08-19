import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import TimecodeInput from "./components/TimecodeInput";
import BaseButton from "@metascore-library/core/modules/button";

export default class TimecodeInputModule extends AbstractModule {
  static id = "timecode_input";

  static dependencies = [BaseButton];

  constructor({ app }) {
    super(arguments);

    app.component("TimecodeInput", TimecodeInput);
  }
}
