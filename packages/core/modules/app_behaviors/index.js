import { readonly } from "vue";
import { storeToRefs } from "pinia";
import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import useStore from "./store";
import plugin from "./store/plugin";
import AppComponents from "../app_components";
import MediaCuepoints from "../media_cuepoints";
import MediaPlayer from "../media_player";

export default class AppBehaviorsModule extends AbstractModule {
  static id = "app_behaviors";

  static dependencies = [AppComponents, MediaCuepoints, MediaPlayer];

  constructor({ pinia }) {
    super(arguments);

    pinia.use(plugin);
  }

  init(data) {
    const store = useStore();
    store.init(data);
  }

  get data() {
    const store = useStore();
    const { behaviors } = storeToRefs(store);
    return readonly(behaviors);
  }

  setData(value) {
    const store = useStore();
    store.update(value);
  }

  enable() {
    const store = useStore();
    store.enable();
  }

  disable() {
    const store = useStore();
    store.disable();
  }

  onStoreAction(callback) {
    const store = useStore();
    store.$onAction(callback);
  }
}
