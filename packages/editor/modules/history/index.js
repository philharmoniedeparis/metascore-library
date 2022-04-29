import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import useStore from "./store";
import plugin from "./store/plugin";
import StyledButton from "@metascore-library/core/modules/styled_button";
import HistoryController from "./components/HistoryController";

export default class HistoryModule extends AbstractModule {
  static id = "history";

  static dependencies = [StyledButton];

  constructor({ app, pinia }) {
    super(arguments);

    app.component("HistoryController", HistoryController);
    pinia.use(plugin);
  }

  get store() {
    return useStore();
  }
}
