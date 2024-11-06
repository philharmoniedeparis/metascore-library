import { storeToRefs } from "pinia";
import { readonly } from "vue";

import AbstractModule from "@core/services/module-manager/AbstractModule";
import useStore from "./store";

export default class AssetsManagerModule extends AbstractModule {
  static id = "assets_manager";

  init(data) {
    const store = useStore();
    store.init(data);
  }

  get assets() {
    const store = useStore();
    const { all } = storeToRefs(store);
    return readonly(all);
  }

  getName(asset) {
    const store = useStore();
    return store.getName(asset);
  }

  getFontName(asset) {
    const store = useStore();
    return store.getFontName(asset);
  }

  getFile(asset) {
    const store = useStore();
    return store.getFile(asset);
  }

  getType(asset) {
    const store = useStore();
    return store.getType(asset);
  }

  addAsset(data) {
    const store = useStore();
    return store.add(data);
  }

  deleteAsset(id) {
    const store = useStore();
    return store.delete(id);
  }

  onStoreAction(callback) {
    const store = useStore();
    return store.$onAction(callback);
  }
}
