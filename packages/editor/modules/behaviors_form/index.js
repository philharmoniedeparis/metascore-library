import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import useStore from "./store";

import CollapsiblePanel from "../collapsible_panel";
import BehaviorsForm from "./components/BehaviorsForm";

export default class BehaviorsFormModule extends AbstractModule {
  static id = "behaviors-form";

  static dependencies = [CollapsiblePanel];

  constructor({ app }) {
    super(arguments);

    app.component("BehaviorsForm", BehaviorsForm);
  }

  configure(configs) {
    const store = useStore();
    store.configure(configs);
  }
}
