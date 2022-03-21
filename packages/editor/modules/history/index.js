import StyledButton from "@metascore-library/core/modules/styled_button";
import * as manager from "./services/history-manager";
import HistoryController from "./components/HistoryController";

export default {
  id: "history",
  dependencies: [StyledButton],
  install({ app, pinia }) {
    app.component("HistoryController", HistoryController);

    pinia.use(({ store }) => {
      manager.addStore(store);
    });

    return {
      manager,
    };
  },
};
