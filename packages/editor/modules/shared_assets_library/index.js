import store from "./store";
import FormGroup from "@metascore-library/core/modules/form_group";
import StyledButton from "@metascore-library/core/modules/styled_button";
import AseetsLibrary from "../assets_library";
import SharedAssetsLibrary from "./components/SharedAssetsLibrary";
import SharedAssetsToolbar from "./components/SharedAssetsToolbar";

export default {
  name: "SharedAssetsLibrary",
  dependencies: [FormGroup, StyledButton, AseetsLibrary],
  stores: {
    "shared-assets": store,
  },
  install({ app }) {
    app.component("SharedAssetsLibrary", SharedAssetsLibrary);
    app.component("SharedAssetsToolbar", SharedAssetsToolbar);
  },
};
