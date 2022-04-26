import useStore from "./store";
import AutoSaveIndicator from "./components/AutoSaveIndicator";

export default {
  id: "auto_save",
  install({ app }) {
    app.component("AutoSaveIndicator", AutoSaveIndicator);

    return {
      configure: (configs) => {
        useStore().configure(configs);
      },
    };
  },
};
