import { storeToRefs, type StoreOnActionListener, type StateTree } from 'pinia'
import { readonly } from "vue";

import AbstractModule from "@core/services/module-manager/AbstractModule";
import useStore, { type Item, type SharedItem } from "./store";

export default class AssetsManagerModule extends AbstractModule {
  static id = "core:assets_manager";

  init(data: Array<Item | SharedItem>) {
    const store = useStore();
    store.init(data);
  }

  get assets() {
    const store = useStore();
    const { all } = storeToRefs(store);
    return readonly(all);
  }

  getName(asset: Item|SharedItem) {
    const store = useStore();
    return store.getName(asset);
  }

  getFontName(asset: Item|SharedItem) {
    const store = useStore();
    return store.getFontName(asset);
  }

  getFile(asset: Item|SharedItem) {
    const store = useStore();
    return store.getFile(asset);
  }

  getType(asset: Item|SharedItem) {
    const store = useStore();
    return store.getType(asset);
  }

  addAsset(data: Item|SharedItem) {
    const store = useStore();
    return store.add(data);
  }

  deleteAsset(id: number) {
    const store = useStore();
    return store.delete(id);
  }

  onStoreAction(callback: StoreOnActionListener<"assets-manager", StateTree, unknown, unknown>) {
    const store = useStore();
    return store.$onAction(callback);
  }
}