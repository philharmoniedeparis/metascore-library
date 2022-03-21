import useStore from "./store";
import plugin from "./store/plugin";
import StyledButton from "@metascore-library/core/modules/styled_button";
import HistoryController from "./components/HistoryController";

export default {
  id: "history",
  dependencies: [StyledButton],
  install({ app, pinia }) {
    app.component("HistoryController", HistoryController);
    pinia.use(plugin);

    return {
      useStore,
    };
  },
};
