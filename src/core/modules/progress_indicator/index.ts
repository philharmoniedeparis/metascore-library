import AbstractModule, { type Context } from "@core/services/module-manager/AbstractModule";
import Modal from "../modal";
import ProgressIndicator from "./components/ProgressIndicator.vue";

export default class ProgressIndicatorModule extends AbstractModule {
  static id = "core:progress_indicator";

  static dependencies = [Modal];

  constructor(context: Context) {
    super(context);

    const { app } = context;
    app.component("ProgressIndicator", ProgressIndicator);
  }
}
