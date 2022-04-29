import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import useStore from "./store";
import Ajax from "@metascore-library/core/modules/ajax";
import Alert from "@metascore-library/core/modules/alert";
import Confirm from "@metascore-library/core/modules/confirm";
import FormControls from "../form_controls";
import ProgressIndicator from "@metascore-library/core/modules/progress_indicator";
import SchemaForm from "../schema_form";
import StyledButton from "@metascore-library/core/modules/styled_button";
import AssetsLibrary from "./components/AssetsLibrary";

export default class AssetsLibraryModule extends AbstractModule {
  static id = "assets_library";

  static dependencies = [
    Ajax,
    Alert,
    Confirm,
    FormControls,
    ProgressIndicator,
    SchemaForm,
    StyledButton,
  ];

  constructor({ app }) {
    super(arguments);

    app.component("AssetsLibrary", AssetsLibrary);
  }

  get store() {
    return useStore();
  }

  configure(configs) {
    this.store.configure(configs);
  }
}
