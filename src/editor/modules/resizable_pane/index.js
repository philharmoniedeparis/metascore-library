import AbstractModule from "@core/services/module-manager/AbstractModule";
import ResizablePane from "./components/ResizablePane.vue";

export default class ResizablePaneModule extends AbstractModule {
  static id = "editor:resizable_pane";

  constructor({ app }) {
    super(arguments);

    app.component("ResizablePane", ResizablePane);
  }
}
