import AbstractModule from "@core/services/module-manager/AbstractModule";
import TabsContainer from "./components/TabsContainer.vue";
import TabsItem from "./components/TabsItem.vue";

export default class TabsModule extends AbstractModule {
  static id = "editor:tabs";

  constructor({ app }) {
    super(arguments);

    app.component("TabsContainer", TabsContainer);
    app.component("TabsItem", TabsItem);
  }
}
