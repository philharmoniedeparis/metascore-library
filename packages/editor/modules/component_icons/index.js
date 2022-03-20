import ComponentIcon from "./components/ComponentIcon";

export default {
  id: "component_icons",
  install({ app }) {
    app.component("ComponentIcon", ComponentIcon);
  },
};
