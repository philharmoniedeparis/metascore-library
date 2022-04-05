import Modal from "../modal";
import StyledButton from "../styled_button";
import AlertDialog from "./components/AlertDialog";

export default {
  id: "alert",
  dependencies: [Modal, StyledButton],
  install({ app }) {
    app.component("AlertDialog", AlertDialog);
  },
};
