import ComponentIcon from "./components/ComponentIcon";

export default {
  name: "ComponentIcons",
  install({ app }) {
    app.component("ComponentIcon", ComponentIcon);
  },
};
