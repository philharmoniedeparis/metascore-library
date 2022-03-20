import useStore from "./store";
import ContextMenu from "./components/ContextMenu";

export default {
  id: "contextmenu",
  install({ app }) {
    app.component("ContextMenu", ContextMenu);

    return {
      useStore,
    };
  },
};
