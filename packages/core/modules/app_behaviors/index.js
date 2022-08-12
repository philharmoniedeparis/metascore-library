import { readonly } from "vue";
import { storeToRefs } from "pinia";
import { assign } from "lodash";
import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import { useModule } from "@metascore-library/core/services/module-manager";
import useStore from "./store";
import MediaPlayer from "../media_player";
import AppComponents from "../app_components";

export default class AppBehaviorsModule extends AbstractModule {
  static id = "app_behaviors";

  static dependencies = [MediaPlayer, AppComponents];

  constructor(context) {
    super(context);

    const { addHook } = useModule("app_components");
    addHook("get", (data) => {
      const store = useStore();
      if (!data) {
        return;
      }

      const { type, id } = data;
      if (type in store.components && id in store.components[type]) {
        assign(data, store.components[type][id]);
      }
    });
  }

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
