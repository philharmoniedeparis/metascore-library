import useStore from "./";

export default function ({ store }) {
  if (store.$id !== "app-components") return;

  const original_get = store.get;

  return {
    /**
     * Override the app-components's "get" action.
     *
     * @param {string} type The component's type
     * @param {string} id The component's id
     * @returns {object} The component's data
     */
    get(type, id) {
      const { isComponentFrozen, getFrozenComponent } = useStore();
      if (isComponentFrozen({ type, id })) {
        // Get frozen component data.
        return getFrozenComponent({ type, id });
      }

      return original_get(type, id);
    },
  };
}
