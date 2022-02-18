import ContextMenu from "./components/ContextMenu";

export default {
  name: "ContextMenu",
  install({ app }) {
    app.component("ContextMenu", ContextMenu);
  },
};

export { default as useContextmenu } from "./composables/useContextmenu";
