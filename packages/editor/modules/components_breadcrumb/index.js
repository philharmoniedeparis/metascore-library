import AbstractModule from "@core/services/module-manager/AbstractModule";
import AppComponents from "@core/modules/app_components";
import AppPreview from "../app_preview";
import ComponentsBreadcrumb from "./components/ComponentsBreadcrumb";

export default class ComponentsBreadcrumbModule extends AbstractModule {
  static id = "components_breadcrumb";

  static dependencies = [AppComponents, AppPreview];

  constructor({ app }) {
    super(arguments);

    app.component("ComponentsBreadcrumb", ComponentsBreadcrumb);
  }
}
