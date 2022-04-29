import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import Modal from "@metascore-library/core/modules/modal";
import ModalForm from "./components/ModalForm";

export default class ModalFormModule extends AbstractModule {
  static id = "modal_form";

  static dependencies = [Modal];

  constructor({ app }) {
    super(arguments);

    app.component("ModalForm", ModalForm);
  }
}
