import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import AppComponents from "@metascore-library/core/modules/app_components";
import ComponentsLibrary from "./components/ComponentsLibrary";

export default class ComponentsLibraryModule extends AbstractModule {
  static id = "components_library";

  static dependencies = [AppComponents];

  constructor({ app }) {
    super(arguments);

    app.component("ComponentsLibrary", ComponentsLibrary);
  }
}
