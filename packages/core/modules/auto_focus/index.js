import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import directive from "./directives/autofocus";

export default class AutoFocusModule extends AbstractModule {
  static id = "auto_focus";

  constructor({ app }) {
    super(arguments);

    app.directive("autofocus", directive);
  }
}
