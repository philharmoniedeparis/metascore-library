import useStore from "./store";
import directive from "./directives/contexmenu";
import ContextMenu from "./components/ContextMenu";

export default {
  id: "contextmenu",
  install({ app }) {
    app.directive("contextmenu", directive);
    app.component("ContextMenu", ContextMenu);

    return {
      useStore,
    };
  },
};
