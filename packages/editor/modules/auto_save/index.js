import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import Ajax from "@metascore-library/core/modules/ajax";
import useStore from "./store";
import AutoSaveIndicator from "./components/AutoSaveIndicator";

export default class AutoSaveModule extends AbstractModule {
  static id = "auto_save";

  static dependencies = [Ajax];

  constructor({ app }) {
    super(arguments);

    app.component("AutoSaveIndicator", AutoSaveIndicator);
  }

  configure(configs) {
    const store = useStore();
    store.configure(configs);
  }
}
