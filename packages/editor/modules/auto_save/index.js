import useStore from "./store";
import Ajax from "@metascore-library/core/modules/ajax";
import AutoSaveIndicator from "./components/AutoSaveIndicator";

export default {
  id: "auto_save",
  dependencies: [Ajax],
  install({ app }) {
    app.component("AutoSaveIndicator", AutoSaveIndicator);

    return {
      configure: (configs) => {
        useStore().configure(configs);
      },
    };
  },
};
