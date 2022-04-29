import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import ComponentIcon from "./components/ComponentIcon";

export default class ComponentIconsModule extends AbstractModule {
  static id = "component_icons";

  constructor({ app }) {
    super(arguments);

    app.component("ComponentIcon", ComponentIcon);
  }
}
