import useStore from "./store";
import Alert from "@metascore-library/core/modules/alert";
import Confirm from "@metascore-library/core/modules/confirm";
import FormControls from "../form_controls";
import ProgressIndicator from "@metascore-library/core/modules/progress_indicator";
import SchemaForm from "../schema_form";
import StyledButton from "@metascore-library/core/modules/styled_button";
import AssetsLibrary from "./components/AssetsLibrary";

export default {
  id: "assets_library",
  dependencies: [
    Alert,
    Confirm,
    FormControls,
    ProgressIndicator,
    SchemaForm,
    StyledButton,
  ],
  install({ app }) {
    app.component("AssetsLibrary", AssetsLibrary);

    return {
      useStore,
      configure: (configs) => {
        useStore().configure(configs);
      },
    };
  },
};
