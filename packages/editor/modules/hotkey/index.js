import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import Modal from "@metascore-library/core/modules/modal";
import directive from "./directives/hotkey";
import HotkeyList from "./components/HotkeyList";

export default class HotkeyModule extends AbstractModule {
  static id = "hotkey";

  static dependencies = [Modal];

  constructor({ app }) {
    super(arguments);

    app.directive("hotkey", directive);
    app.component("HotkeyList", HotkeyList);
  }
}
