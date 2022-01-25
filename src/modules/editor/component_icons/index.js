import ComponentIcon from "./components/ComponentIcon";

export default {
  name: "ComponentIcons",
  async install({ app }) {
    app.component("ComponentIcon", ComponentIcon);
  },
};
