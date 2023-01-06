import { readonly } from "vue";
import { storeToRefs } from "pinia";
import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import useStore from "./store";
import storePlugin from "./store/plugin";
import BaseButton from "@metascore-library/core/modules/button";
import HistoryController from "./components/HistoryController";

export default class HistoryModule extends AbstractModule {
  static id = "history";

  static dependencies = [BaseButton];

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

  endGroup() {
    const store = useStore();
    store.endGroup();
  }

  async undo() {
    const store = useStore();
    return store.undo();
  }

  redo() {
    const store = useStore();
    return store.redo();
  }

  clear() {
    const store = useStore();
    return store.clear();
  }
}
