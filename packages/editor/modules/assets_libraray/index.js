import store from "./store";
import StyledButton from "@metascore-library/core/modules/styled_button";
import Confirm from "@metascore-library/core/modules/confirm";
import AssetsLibrary from "./components/AssetsLibrary";

export default {
  name: "AssetsLibrary",
  dependencies: [StyledButton, Confirm],
  stores: {
    assets: store,
  },
  install({ app }) {
    app.component("AssetsLibrary", AssetsLibrary);
  },
};
