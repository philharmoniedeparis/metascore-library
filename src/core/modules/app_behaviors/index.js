import { readonly, markRaw } from "vue";
import { storeToRefs } from "pinia";
import AbstractModule from "@core/services/module-manager/AbstractModule";
import useStore from "./store";
import AppComponents from "../app_components";
import AppRenderer from "../app_renderer";
import MediaCuepoints from "../media_cuepoints";
import MediaPlayer from "../media_player";
import Blockly from "./blockly";

export default class AppBehaviorsModule extends AbstractModule {
  static id = "app_behaviors";

  static dependencies = [
    AppComponents,
    AppRenderer,
    MediaCuepoints,
    MediaPlayer,
  ];

  async init(data) {
    const store = useStore();
    return await store.init(data);
  }

  get Blockly() {
    return markRaw(Blockly);
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
    return store.$onAction(callback);
  }
}
