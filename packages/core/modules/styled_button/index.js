import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import StyledButton from "./components/StyledButton";

export default class StyledButtonModule extends AbstractModule {
  static id = "styled_button";

  constructor({ app }) {
    super(arguments);

    app.component("StyledButton", StyledButton);
  }
}
