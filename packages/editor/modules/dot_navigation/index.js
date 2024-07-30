import AbstractModule from "@core/services/module-manager/AbstractModule";
import DotNavigation from "./components/DotNavigation";

export default class DotNavigationModule extends AbstractModule {
  static id = "dot_navigation";

  constructor({ app }) {
    super(arguments);

    app.component("DotNavigation", DotNavigation);
  }
}
