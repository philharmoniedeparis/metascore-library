import createDirective from "./directives/contextmenu";
import ContextMenu from "./components/ContextMenu";
import moduleStore from "./store";

export default {
  name: "ContextMenu",
  install({ app, store }) {
    app.directive("contextmenu", createDirective(store));
    app.component("ContextMenu", ContextMenu);
    store.registerModule("contextmenu", moduleStore);
  },
};
