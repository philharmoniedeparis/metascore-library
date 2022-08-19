import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import Ajax from "@metascore-library/core/modules/ajax";
import AseetsLibrary from "../assets_library";
import FormGroup from "../form_group";
import ProgressIndicator from "@metascore-library/core/modules/progress_indicator";
import SharedAssetsLibrary from "./components/SharedAssetsLibrary";
import SharedAssetsToolbar from "./components/SharedAssetsToolbar";
import BaseButton from "@metascore-library/core/modules/button";
import useStore from "./store";

export default class SharedAssetsLibraryModule extends AbstractModule {
  static id = "shared_assets_library";

  static dependencies = [
    Ajax,
    AseetsLibrary,
    FormGroup,
    ProgressIndicator,
    BaseButton,
  ];

  constructor({ app }) {
    super(arguments);

    app.component("SharedAssetsLibrary", SharedAssetsLibrary);
    app.component("SharedAssetsToolbar", SharedAssetsToolbar);
  }

  configure(configs) {
    const store = useStore();
    store.configure(configs);
  }
}
