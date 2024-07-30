import { readonly } from "vue";
import { storeToRefs } from "pinia";
import AbstractModule from "@core/services/module-manager/AbstractModule";
import UserPreferencesForm from "./components/UserPreferencesForm";
import useStore from "./store";
import Ajax from "@core/modules/ajax";

export default class UserPreferencesModule extends AbstractModule {
  static id = "user_preferences";

  static dependencies = [Ajax];

  constructor({ app }) {
    super(arguments);

    app.component("UserPreferencesForm", UserPreferencesForm);
  }

  configure(configs) {
    const store = useStore();
    store.configure(configs);
  }

  async init() {
    const store = useStore();
    await store.init();
  }

  get data() {
    const store = useStore();
    const { data } = storeToRefs(store);
    return readonly(data);
  }
}
