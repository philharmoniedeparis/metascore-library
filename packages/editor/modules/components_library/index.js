import ComponentsLibrary from "./components/ComponentsLibrary";
import ComponentIcons from "../component_icons";

export default {
  id: "components_library",
  dependencies: [ComponentIcons],
  install({ app }) {
    app.component("ComponentsLibrary", ComponentsLibrary);
  },
};
