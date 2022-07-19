import { readonly } from "vue";
import { storeToRefs } from "pinia";
import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import useStore from "./store";
import MediaPlayer from "../media_player";

export default class AppBehaviorsModule extends AbstractModule {
  static id = "app_behaviors";

  static dependencies = [MediaPlayer];

  init(data) {
    const store = useStore();
    store.init(data);
  }

  get behaviors() {
    const store = useStore();
    const { behaviors } = storeToRefs(store);
    return readonly(behaviors);
  }

  setBehaviors(value) {
    const store = useStore();
    store.setBehaviors(value);
  }
}
