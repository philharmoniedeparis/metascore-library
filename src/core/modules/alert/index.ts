import AbstractModule, { type Context } from "@core/services/module-manager/AbstractModule";
import Modal from "../modal";
import BaseButton from "../button";
import AlertDialog from "./components/AlertDialog.vue";

export default class AlertModule extends AbstractModule {
  static id = "core:alert";

  static dependencies = [Modal, BaseButton];

  constructor(context: Context) {
    super(context);

    const { app } = context;
    app.component("AlertDialog", AlertDialog);
  }
}
