import ComponentsLibrary from "./components/ComponentsLibrary";
import ComponentIcons from "../component_icons";

export default {
  name: "ComponentsLibrary",
  async dependencies() {
    const { default: AppComponents } = await import(
      /* webpackChunkName: "Editor.PlayerPreview" */ "@metascore-library/player/modules/app_components"
    );

    return [AppComponents, ComponentIcons];
  },
  install({ app }) {
    app.component("ComponentsLibrary", ComponentsLibrary);
  },
};