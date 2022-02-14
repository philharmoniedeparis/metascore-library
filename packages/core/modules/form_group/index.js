import FormGroup from "./components/FormGroup";

export default {
  name: "FormGroup",
  install({ app }) {
    app.component("FormGroup", FormGroup);
  },
};
