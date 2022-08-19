import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import BaseButton from "./components/BaseButton";

export default class BaseButtonModule extends AbstractModule {
  static id = "base_button";

  constructor({ app }) {
    super(arguments);

    app.component("BaseButton", BaseButton);
  }
}
