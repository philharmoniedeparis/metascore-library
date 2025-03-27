import AbstractModule from "@core/services/module-manager/AbstractModule";
import Modal from "../modal";
import BaseButton from "../button";
import AlertDialog from "./components/AlertDialog.vue";

export default class AlertModule extends AbstractModule {
  static id = "core:alert";

  static dependencies = [Modal, BaseButton];

  constructor({ app }) {
    super(arguments);

    app.component("AlertDialog", AlertDialog);
  }
}
