import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import ResizablePane from "./components/ResizablePane";

export default class ResizablePaneModule extends AbstractModule {
  static id = "resizable_pane";

  constructor({ app }) {
    super(arguments);

    app.component("ResizablePane", ResizablePane);
  }
}
