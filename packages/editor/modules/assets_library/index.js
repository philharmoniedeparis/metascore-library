import AbstractModule from "@core/services/module-manager/AbstractModule";
import useStore from "./store";
import Ajax from "@core/modules/ajax";
import Alert from "@core/modules/alert";
import AssetsManager from "@core/modules/assets_manager";
import AppComponents from "@core/modules/app_components";
import AppPreview from "@editor/modules/app_preview";
import Confirm from "@core/modules/confirm";
import FormControls from "../form_controls";
import ProgressIndicator from "@core/modules/progress_indicator";
import SchemaForm from "../schema_form";
import BaseButton from "@core/modules/button";
import AssetsLibrary from "./components/AssetsLibrary";

export default class AssetsLibraryModule extends AbstractModule {
  static id = "assets_library";

  static dependencies = [
    Ajax,
    Alert,
    AssetsManager,
    AppComponents,
    AppPreview,
    Confirm,
    FormControls,
    ProgressIndicator,
    SchemaForm,
    BaseButton,
  ];

  constructor({ app }) {
    super(arguments);

    app.component("AssetsLibrary", AssetsLibrary);
  }

  configure(configs) {
    const store = useStore();
    store.configure(configs);
  }

  async uploadFiles(files) {
    const store = useStore();
    return await store.upload(files);
  }
}
