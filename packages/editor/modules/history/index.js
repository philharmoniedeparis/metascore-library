import { readonly } from "vue";
import { storeToRefs } from "pinia";
import AbstractModule from "@core/services/module-manager/AbstractModule";
import useStore from "./store";
import storePlugin from "./store/plugin";
import BaseButton from "@core/modules/button";
import Hotkey from "../hotkey";
import HistoryController from "./components/HistoryController";

export default class HistoryModule extends AbstractModule {
  static id = "history";

  static dependencies = [BaseButton, Hotkey];

  constructor({ app, pinia }) {
    super(arguments);

    app.component("HistoryController", HistoryController);
    pinia.use(storePlugin);
  }

  get active() {
    const store = useStore();
    const { active } = storeToRefs(store);
    return readonly(active);
  }

  activate() {
    const store = useStore();
    store.active = true;
  }

  deactivate() {
    const store = useStore();
    store.active = false;
  }

  startGroup({ coalesce = false, coalesceId } = {}) {
    const store = useStore();
    return store.startGroup({ coalesce, coalesceId });
  }

  endGroup(discard = false) {
    const store = useStore();
    store.endGroup(discard);
  }

  async undo() {
    const store = useStore();
    return await store.undo();
  }

  async redo() {
    const store = useStore();
    return await store.redo();
  }

  clear() {
    const store = useStore();
    return store.clear();
  }
}
