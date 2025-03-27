import { readonly } from "vue";
import { storeToRefs } from "pinia";
import AbstractModule from "@core/services/module-manager/AbstractModule";
import useStore from "./store";

export default class ClipboardModule extends AbstractModule {
  static id = "editor:clipboard";

  hasData(format) {
    const store = useStore();
    return format === store.format;
  }

  getData(format) {
    const store = useStore();
    if (format === store.format) {
      const { data } = storeToRefs(store);
      return readonly(data);
    }

    return null;
  }

  setData(format, data) {
    const store = useStore();
    store.setData(format, data);
  }

  clear() {
    const store = useStore();
    store.clear();
  }
}
