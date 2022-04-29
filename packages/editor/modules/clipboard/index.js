import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import useStore from "./store";

export default class ClipboardModule extends AbstractModule {
  static id = "clipboard";

  constructor() {
    super(arguments);
  }

  get store() {
    return useStore();
  }
}
