import useStore from "./store";
import StyledButton from "@metascore-library/core/modules/styled_button";
import HistoryController from "./components/HistoryController";

export default {
  id: "history",
  dependencies: [StyledButton],
  install({ app }) {
    app.component("HistoryController", HistoryController);

    return {
      useStore,
    };
  },
};
