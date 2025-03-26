import AbstractModule from "@core/services/module-manager/AbstractModule";
import Modal from "@core/modules/modal";
import ModalForm from "./components/ModalForm.vue";

export default class ModalFormModule extends AbstractModule {
  static id = "modal_form";

  static dependencies = [Modal];

  constructor({ app }) {
    super(arguments);

    app.component("ModalForm", ModalForm);
  }
}
