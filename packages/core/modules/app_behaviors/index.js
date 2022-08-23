import { readonly, markRaw } from "vue";
import { storeToRefs } from "pinia";
import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import useStore from "./store";
import plugin from "./store/plugin";
import AppComponents from "../app_components";
import MediaCuepoints from "../media_cuepoints";
import MediaPlayer from "../media_player";
import Blockly from "./blockly";

export default class AppBehaviorsModule extends AbstractModule {
  static id = "app_behaviors";

  static async dependencies({ i18n }) {
    // Import the locale.
    const locale = i18n.global.locale;
    const { default: blocklyLocale } = await import(
      /* webpackMode: "lazy" */
      /* webpackChunkName: "blockly-locale-[request]" */
      `./blockly/msg/${locale}`
    );

    Blockly.setLocale(blocklyLocale);

    return [AppComponents, MediaCuepoints, MediaPlayer];
  }

  constructor({ pinia }) {
    super(arguments);

    pinia.use(plugin);
  }

  init(data) {
    const store = useStore();
    store.init(data);
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
    store.$onAction(callback);
  }
}
