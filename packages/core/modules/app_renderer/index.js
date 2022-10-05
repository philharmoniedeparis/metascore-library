import { readonly } from "vue";
import { storeToRefs } from "pinia";
import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
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

  onStoreAction(callback) {
    const store = useStore();
    return store.$onAction(callback);
  }
}
