import useStore from "./";

export default function ({ options, store }) {
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
}
