import FormGroup from "./components/FormGroup";

export default {
  id: "form_group",
  install({ app }) {
    app.component("FormGroup", FormGroup);
  },
};
