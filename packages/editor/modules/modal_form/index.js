import Modal from "@metascore-library/core/modules/modal";
import ModalForm from "./components/ModalForm";

export default {
  id: "modal_form",
  dependencies: [Modal],
  install({ app }) {
    app.component("ModalForm", ModalForm);
  },
};
