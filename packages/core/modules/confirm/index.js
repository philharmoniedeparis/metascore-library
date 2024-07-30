import AbstractModule from "@core/services/module-manager/AbstractModule";
import Modal from "../modal";
import BaseButton from "../button";
import ConfirmDialog from "./components/ConfirmDialog";

export default class ConfirmModule extends AbstractModule {
  static id = "confirm";

  static dependencies = [Modal, BaseButton];

  constructor({ app }) {
    super(arguments);

    app.component("ConfirmDialog", ConfirmDialog);
  }
}
