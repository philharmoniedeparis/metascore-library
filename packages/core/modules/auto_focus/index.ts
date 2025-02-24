import AbstractModule, { type Context } from "@core/services/module-manager/AbstractModule";
import directive from "./directives/autofocus";

export default class AutoFocusModule extends AbstractModule {
  static id = "auto_focus";

  constructor(context: Context) {
    super(context)

    const { app } = context;
    app.directive("autofocus", directive);
  }
}
