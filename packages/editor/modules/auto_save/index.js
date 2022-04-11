import AutoSaveIndicator from "./components/AutoSaveIndicator";

export default {
  id: "auto_save",
  install({ app }) {
    app.component("AutoSaveIndicator", AutoSaveIndicator);
  },
};
