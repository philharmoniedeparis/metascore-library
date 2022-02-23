import store from "./store";
import StyledButton from "@metascore-library/core/modules/styled_button";
import SharedAssetsLibrary from "./components/SharedAssetsLibrary";

export default {
  name: "SharedAssetsLibrary",
  dependencies: [StyledButton],
  stores: {
    "shared-assets": store,
  },
  install({ app }) {
    app.component("SharedAssetsLibrary", SharedAssetsLibrary);
  },
};
