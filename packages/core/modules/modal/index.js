import StyledButton from "../styled_button";
import BaseModal from "./components/BaseModal";

export default {
  id: "modal",
  dependencies: [StyledButton],
  install({ app }) {
    app.component("BaseModal", BaseModal);
  },
};
