import AbstractModule from "@core/services/module-manager/AbstractModule";

import CollapsiblePanel from "./components/CollapsiblePanel.vue";

export default class CollapsiblePanelModule extends AbstractModule {
  static id = "collapsible_panel";

  constructor({ app }) {
    super(arguments);

    app.component("CollapsiblePanel", CollapsiblePanel);
  }
}
