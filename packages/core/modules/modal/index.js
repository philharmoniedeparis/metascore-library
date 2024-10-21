import AbstractModule from "@core/services/module-manager/AbstractModule";
import BaseButton from "../button";
import BaseModal from "./components/BaseModal";

export default class ModalModule extends AbstractModule {
  static id = "modal";

  static dependencies = [BaseButton];

  constructor({ app }) {
    super(arguments);

    app.component("BaseModal", BaseModal);
  }
}
