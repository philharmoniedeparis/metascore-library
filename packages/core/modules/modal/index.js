import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import StyledButton from "../styled_button";
import BaseModal from "./components/BaseModal";

export default class ModalModule extends AbstractModule {
  static id = "modal";

  static dependencies = [StyledButton];

  constructor({ app }) {
    super(arguments);

    app.component("BaseModal", BaseModal);
  }
}
