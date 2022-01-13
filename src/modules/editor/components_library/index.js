import ComponentsLibrary from "./components/ComponentsLibrary";

export default {
  name: "ComponentsLibrary",
  install({ app }) {
    app.component("ComponentsLibrary", ComponentsLibrary);
  },
};
