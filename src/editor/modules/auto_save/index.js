import AbstractModule from "@core/services/module-manager/AbstractModule";
import Ajax from "@core/modules/ajax";
import useStore from "./store";
import AutoSaveIndicator from "./components/AutoSaveIndicator.vue";

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

  isDataAvailable() {
    const store = useStore();
    return store.isDataAvailable();
  }

  load() {
    const store = useStore();
    return store.load();
  }

  delete() {
    const store = useStore();
    return store.delete();
  }
}
