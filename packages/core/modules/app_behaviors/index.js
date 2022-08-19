import { readonly } from "vue";
import { storeToRefs } from "pinia";
import { assign } from "lodash";
import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import { useModule } from "@metascore-library/core/services/module-manager";
import useStore from "./store";
import AppComponents, {
  Events as AppComponentsEvents,
} from "../app_components";
import EventBus from "../event_bus";
import MediaCuepoints from "../media_cuepoints";
import MediaPlayer from "../media_player";

export default class AppBehaviorsModule extends AbstractModule {
  static id = "app_behaviors";

  static dependencies = [AppComponents, EventBus, MediaCuepoints, MediaPlayer];

  constructor(context) {
    super(context);

    const event_bus = useModule("event_bus");
    event_bus.on(AppComponentsEvents.COMPONENT_GET, (data) => {
      if (!data) {
        return;
      }

      const store = useStore();
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

  get data() {
    const store = useStore();
    const { behaviors } = storeToRefs(store);
    return readonly(behaviors);
  }

  setData(value) {
    const store = useStore();
    store.update(value);
  }

  onStoreAction(callback) {
    const store = useStore();
    store.$onAction(callback);
  }
}
