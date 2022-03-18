import useStore from "./store";
import ContextMenu from "./components/ContextMenu";

export default {
  name: "ContextMenu",
  install({ app }) {
    app.component("ContextMenu", ContextMenu);

    return {
      useStore,
    };
  },
};
