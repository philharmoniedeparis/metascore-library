import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import Modal from "../modal";
import BaseButton from "../button";
import AlertDialog from "./components/AlertDialog";

export default class AlertModule extends AbstractModule {
  static id = "alert";

  static dependencies = [Modal, BaseButton];

  constructor({ app }) {
    super(arguments);

    app.component("AlertDialog", AlertDialog);
  }
}
