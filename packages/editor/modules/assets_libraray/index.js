import StyledButton from "@metascore-library/core/modules/styled_button";
import Confirm from "@metascore-library/core/modules/confirm";
import AssetsLibrary from "./components/AssetsLibrary";
import moduleStore from "./store";

export default {
  name: "AssetsLibrary",
  dependencies: [StyledButton, Confirm],
  install({ app, store }) {
    app.component("AssetsLibrary", AssetsLibrary);
    store.registerModule("assets", moduleStore);
  },
};
