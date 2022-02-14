import StyledButton from "./components/StyledButton";

export default {
  name: "StyledButton",
  install({ app }) {
    app.component("StyledButton", StyledButton);
  },
};
