import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import directive from "./directives/hotkey";

export default class HotkeyModule extends AbstractModule {
  static id = "hotkey";

  constructor({ app }) {
    super(arguments);

    app.directive("hotkey", directive);
  }
}
