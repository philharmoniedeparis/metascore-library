import { assign } from "lodash";
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
      const data = original_get(type, id);

      if (data) {
        const { type, id } = data;
        const { enabled, components } = useStore();

        if (enabled && type in components && id in components[type]) {
          // Override component data with behaviors data.
          return assign({}, data, components[type][id]);
        }
      }

      return data;
    },
  };
}
