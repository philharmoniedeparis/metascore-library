import StyledButton from "../styled_button";
import BaseModal from "./components/BaseModal";
import ModalForm from "./components/ModalForm";

export default {
  name: "Modal",
  dependencies: [StyledButton],
  install({ app }) {
    app.component("BaseModal", BaseModal);
    app.component("ModalForm", ModalForm);
  },
};
