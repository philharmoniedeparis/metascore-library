import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import directive, { install as installDirective } from "./directives/tooltip";

export default class TooltipModule extends AbstractModule {
  static id = "tooltip";

  static dependencies = [];

  constructor({ app }) {
    super(arguments);

    app.directive("tooltip", directive);
  }

  install(wrapper, content, arrow) {
    installDirective(wrapper, content, arrow);
  }
}
