import useStore from "./store";
import StyledButton from "@metascore-library/core/modules/styled_button";
import Confirm from "@metascore-library/core/modules/confirm";
import SchemaForm from "../schema_form";
import AssetsLibrary from "./components/AssetsLibrary";

export default {
  name: "AssetsLibrary",
  dependencies: [StyledButton, Confirm, SchemaForm],
  install({ app }) {
    app.component("AssetsLibrary", AssetsLibrary);

    return {
      useStore,
    };
  },
};
