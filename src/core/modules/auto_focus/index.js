import AbstractModule from "@core/services/module-manager/AbstractModule";
import directive from "./directives/autofocus";

export default class AutoFocusModule extends AbstractModule {
  static id = "core:auto_focus";

  constructor({ app }) {
    super(arguments);

    app.directive("autofocus", directive);
  }
}
