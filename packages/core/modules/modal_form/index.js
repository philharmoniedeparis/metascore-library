import Modal from "../modal";
import ModalForm from "./components/ModalForm";

export default {
  name: "ModalForm",
  dependencies: [Modal],
  install({ app }) {
    app.component("ModalForm", ModalForm);
  },
};
