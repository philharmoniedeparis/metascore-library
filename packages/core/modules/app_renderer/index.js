import { readonly } from "vue";
import { storeToRefs } from "pinia";
import AbstractModule from "@core/services/module-manager/AbstractModule";
import useStore from "./store";
import MediaPlayer from "../media_player";
import AppComponents from "../app_components";
import MediaCuepoints from "../media_cuepoints";
import AppRenderer from "./components/AppRenderer.vue";

export default class AppRendererModule extends AbstractModule {
  static id = "app_renderer";

  static dependencies = [MediaPlayer, MediaCuepoints, AppComponents];

  constructor({ app }) {
    super(arguments);

    app.component("AppRenderer", AppRenderer);
  }

  configure(configs) {
    const store = useStore();
    store.configure(configs);
  }

  init(data) {
    const store = useStore();
    store.init(data);
  }

  get ready() {
    const store = useStore();
    const { ready } = storeToRefs(store);
    return readonly(ready);
  }

  get el() {
    const store = useStore();
    const { el } = storeToRefs(store);
    return readonly(el);
  }

  get width() {
    const store = useStore();
    const { width } = storeToRefs(store);
    return readonly(width);
  }

  get height() {
    const store = useStore();
    const { height } = storeToRefs(store);
    return readonly(height);
  }

  setResponsiveness(adaptSize, allowUpscaling) {
    const store = useStore();
    store.configs.adaptSize = adaptSize;
    if (typeof allowUpscaling !== "undefined") {
      store.configs.allowUpscaling = allowUpscaling;
    }
  }

  setWidth(value) {
    const store = useStore();
    store.setWidth(value);
  }

  setHeight(value) {
    const store = useStore();
    store.setHeight(value);
  }

  setCSS(value) {
    const store = useStore();
    store.setCSS(value);
  }

  getComponentElement(component) {
    const store = useStore();
    return store.getComponentElement(component);
  }

  toggleFullscreen(force) {
    const store = useStore();
    return store.toggleFullscreen(force);
  }

  onStoreAction(callback) {
    const store = useStore();
    return store.$onAction(callback);
  }
}
