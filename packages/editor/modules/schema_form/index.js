import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import FormControls from "../form_controls";
import ArrayControl from "./components/ArrayControl";
import ControlDispatcher from "./components/ControlDispatcher";
import SchemaForm from "./components/SchemaForm";

export default class SchemaFormModule extends AbstractModule {
  static id = "schema_form";

  static dependencies = [FormControls];

  constructor({ app }) {
    super(arguments);

    app.component("ArrayControl", ArrayControl);
    app.component("ControlDispatcher", ControlDispatcher);
    app.component("SchemaForm", SchemaForm);
  }
}
