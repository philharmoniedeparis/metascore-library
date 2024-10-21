import AbstractModule from "@core/services/module-manager/AbstractModule";
import TabsContainer from "./components/TabsContainer";
import TabsItem from "./components/TabsItem";

export default class TabsModule extends AbstractModule {
  static id = "tabs";

  constructor({ app }) {
    super(arguments);

    app.component("TabsContainer", TabsContainer);
    app.component("TabsItem", TabsItem);
  }
}
