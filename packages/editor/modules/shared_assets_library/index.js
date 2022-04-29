import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import useStore from "./store";
import Ajax from "@metascore-library/core/modules/ajax";
import StyledButton from "@metascore-library/core/modules/styled_button";
import AseetsLibrary from "../assets_library";
import FormGroup from "../form_group";
import SharedAssetsLibrary from "./components/SharedAssetsLibrary";
import SharedAssetsToolbar from "./components/SharedAssetsToolbar";

export default class SharedAssetsLibraryModule extends AbstractModule {
  static id = "shared_assets_library";

  static dependencies = [Ajax, StyledButton, FormGroup, AseetsLibrary];

  constructor({ app }) {
    super(arguments);

    app.component("SharedAssetsLibrary", SharedAssetsLibrary);
    app.component("SharedAssetsToolbar", SharedAssetsToolbar);
  }

  get store() {
    return useStore();
  }

  configure(configs) {
    this.store.configure(configs);
  }
}
