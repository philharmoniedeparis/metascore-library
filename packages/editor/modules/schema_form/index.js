import FormControls from "../form_controls";
import ControlDispatcher from "./components/ControlDispatcher";
import SchemaForm from "./components/SchemaForm";

export default {
  name: "SchemaForm",
  dependencies: [FormControls],
  install({ app }) {
    app.component("ControlDispatcher", ControlDispatcher);
    app.component("SchemaForm", SchemaForm);
  },
};
