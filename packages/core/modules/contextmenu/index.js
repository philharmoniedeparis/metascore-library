import store from "./store";
import ContextMenu from "./components/ContextMenu";

export default {
  name: "ContextMenu",
  stores: {
    contextmenu: store,
  },
  install({ app }) {
    app.component("ContextMenu", ContextMenu);
  },
};
