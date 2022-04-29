import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import Modal from "../modal";
import StyledButton from "../styled_button";
import AlertDialog from "./components/AlertDialog";

export default class AlertModule extends AbstractModule {
  static id = "alert";

  static dependencies = [Modal, StyledButton];

  constructor({ app }) {
    super(arguments);

    app.component("AlertDialog", AlertDialog);
  }
}
