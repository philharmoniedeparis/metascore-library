import AbstractModule from "@core/services/module-manager/AbstractModule";
import Modal from "../modal";
import BaseButton from "../button";
import ConfirmDialog from "./components/ConfirmDialog.vue";

export default class ConfirmModule extends AbstractModule {
  static id = "core:confirm";

  static dependencies = [Modal, BaseButton];

  constructor({ app }) {
    super(arguments);

    app.component("ConfirmDialog", ConfirmDialog);
  }
}
