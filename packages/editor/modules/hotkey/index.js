import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import Modal from "@metascore-library/core/modules/modal";
import hotkey_directive from "./directives/hotkey";
import hotkeyhelp_directive from "./directives/hotkeyhelp";
import HotkeyList from "./components/HotkeyList";

export default class HotkeyModule extends AbstractModule {
  static id = "hotkey";

  static dependencies = [Modal];

  constructor({ app }) {
    super(arguments);

    app.directive("hotkey", hotkey_directive);
    app.directive("hotkeyhelp", hotkeyhelp_directive);

    app.component("HotkeyList", HotkeyList);
  }
}
