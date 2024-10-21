import AbstractModule from "@core/services/module-manager/AbstractModule";
import Modal from "../modal";
import ProgressIndicator from "./components/ProgressIndicator";

export default class ProgressIndicatorModule extends AbstractModule {
  static id = "progress_indicator";

  static dependencies = [Modal];

  constructor({ app }) {
    super(arguments);

    app.component("ProgressIndicator", ProgressIndicator);
  }
}
