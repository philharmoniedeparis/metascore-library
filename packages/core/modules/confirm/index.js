import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import Modal from "../modal";
import StyledButton from "../styled_button";
import ConfirmDialog from "./components/ConfirmDialog";

export default class ConfirmModule extends AbstractModule {
  static id = "confirm";

  static dependencies = [Modal, StyledButton];

  constructor({ app }) {
    super(arguments);

    app.component("ConfirmDialog", ConfirmDialog);
  }
}
