import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";

import CollapsiblePanel from "./components/CollapsiblePanel";

export default class CollapsiblePanelModule extends AbstractModule {
  static id = "collapsible_panel";

  constructor({ app }) {
    super(arguments);

    app.component("CollapsiblePanel", CollapsiblePanel);
  }
}
