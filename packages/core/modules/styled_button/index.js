import StyledButton from "./components/StyledButton";

export default {
  id: "styled_button",
  install({ app }) {
    app.component("StyledButton", StyledButton);
  },
};
