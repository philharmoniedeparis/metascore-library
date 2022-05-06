import { readonly } from "vue";
import { storeToRefs } from "pinia";
import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import useStore from "./store";

export default class ClipboardModule extends AbstractModule {
  static id = "clipboard";

  get format() {
    const store = useStore();
    const { format } = storeToRefs(store);
    return readonly(format);
  }

  get data() {
    const store = useStore();
    const { data } = storeToRefs(store);
    return readonly(data);
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
