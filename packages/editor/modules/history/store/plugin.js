import useStore from "./";

export default function ({ options, store }) {
  if (options.history) {
    store.$onAction((action) => {
      const { active, push } = useStore();
      if (!active) {
        return;
      }

      options.history.call(store, {
        ...action,
        push,
      });
    });
  }
}
