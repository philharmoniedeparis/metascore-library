import useStore from "./store";
import StyledButton from "@metascore-library/core/modules/styled_button";
import HistoryController from "./components/HistoryController";

export default {
  id: "history",
  dependencies: [StyledButton],
  install({ app, pinia }) {
    app.component("HistoryController", HistoryController);

    pinia.use(({ options, store }) => {
      if (options.history) {
        store.$onAction((action) => {
          const historyStore = useStore();
          if (!historyStore.active) {
            return;
          }

          options.history.call(store, {
            ...action,
            push: historyStore.push,
          });
        });
      }
    });

    return {
      useStore,
    };
  },
};
