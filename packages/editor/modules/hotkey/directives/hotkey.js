import plugin from "v-hotkey";
import useStore from "../store";

export default {
  mounted(el, binding) {
    const store = useStore();
    let { value } = binding;

    const { group, keys } = value;
    if (group && keys) {
      value = {};

      Object.entries(keys).forEach(([k, { handler, description }]) => {
        store.addCombination(group, k, description);
        value[k] = handler;
      });
    }

    plugin.directive.mounted(el, { ...binding, value });
  },
  updated(el, binding) {
    const store = useStore();
    let { value, oldValue } = binding;

    if (oldValue) {
      const { group: oldGroup, keys: oldKeys } = oldValue;
      if (oldGroup && oldKeys) {
        oldValue = {};
        Object.keys(oldKeys).forEach((k) => {
          store.removeCombination(oldGroup, k);
        });
      }
    }

    const { group, keys } = value;
    if (group && keys) {
      value = {};
      Object.entries(keys).forEach(([k, { handler, description }]) => {
        store.addCombination(group, k, description);
        value[k] = handler;
      });
    }

    plugin.directive.updated(el, { ...binding, value, oldValue });
  },
  beforeUnmount(el, binding) {
    const store = useStore();
    let { value } = binding;

    const { group, keys } = value;
    if (group && keys) {
      value = {};
      Object.keys(binding.value).forEach((k) => {
        store.removeCombination(group, k);
      });
    }

    plugin.directive.beforeUnmount(el, { ...binding, value });
  },
};
