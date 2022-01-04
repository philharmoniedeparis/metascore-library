import SharedAssetsLibrary from "./components/SharedAssetsLibrary";

export default {
  name: "SharedAssetsLibrary",
  install({ app }) {
    app.component("shared-assets-library", SharedAssetsLibrary);
  },
};
