import useStore from "./store";
import StyledButton from "@metascore-library/core/modules/styled_button";
import AseetsLibrary from "../assets_library";
import FormGroup from "../form_group";
import SharedAssetsLibrary from "./components/SharedAssetsLibrary";
import SharedAssetsToolbar from "./components/SharedAssetsToolbar";

export default {
  name: "SharedAssetsLibrary",
  dependencies: [StyledButton, FormGroup, AseetsLibrary],
  install({ app }) {
    app.component("SharedAssetsLibrary", SharedAssetsLibrary);
    app.component("SharedAssetsToolbar", SharedAssetsToolbar);

    return {
      useStore,
    };
  },
};
