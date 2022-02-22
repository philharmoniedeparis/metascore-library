import Modal from "../modal";
import StyledButton from "../styled_button";
import ConfirmDialog from "./components/ConfirmDialog";

export default {
  name: "ConfirmDialog",
  dependencies: [Modal, StyledButton],
  install({ app }) {
    app.component("ConfirmDialog", ConfirmDialog);
  },
};
