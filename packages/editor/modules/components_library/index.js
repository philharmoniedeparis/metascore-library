import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import ComponentsLibrary from "./components/ComponentsLibrary";
import ComponentIcons from "../component_icons";

export default class ComponentsLibraryModule extends AbstractModule {
  static id = "components_library";

  static dependencies = [ComponentIcons];

  constructor({ app }) {
    super(arguments);

    app.component("ComponentsLibrary", ComponentsLibrary);
  }
}
