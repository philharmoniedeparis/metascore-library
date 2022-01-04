import AssetsLibrary from "./components/AssetsLibrary";

export default {
  name: "AssetsLibrary",
  install({ app }) {
    app.component("assets-library", AssetsLibrary);
  },
};
