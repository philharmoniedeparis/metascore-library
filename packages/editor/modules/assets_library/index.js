import { readonly } from "vue";
import { storeToRefs } from "pinia";
import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import useStore from "./store";
import Ajax from "@metascore-library/core/modules/ajax";
import Alert from "@metascore-library/core/modules/alert";
import Confirm from "@metascore-library/core/modules/confirm";
import FormControls from "../form_controls";
import ProgressIndicator from "@metascore-library/core/modules/progress_indicator";
import SchemaForm from "../schema_form";
import BaseButton from "@metascore-library/core/modules/button";
import AssetsLibrary from "./components/AssetsLibrary";

export default class AssetsLibraryModule extends AbstractModule {
  static id = "assets_library";

  static dependencies = [
    Ajax,
    Alert,
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

  init(data) {
    const store = useStore();
    store.init(data);
  }

  get assets() {
    const store = useStore();
    const { all } = storeToRefs(store);
    return readonly(all);
  }

  getAssetsByType(type) {
    const store = useStore();
    return store.getByType(type);
  }

  addAsset(data) {
    const store = useStore();
    return store.add(data);
  }

  uploadFiles(files) {
    const store = useStore();
    return store.upload(files);
  }

  addStoreActionListener(callback) {
    const store = useStore();
    store.$onAction(callback);
  }
}
