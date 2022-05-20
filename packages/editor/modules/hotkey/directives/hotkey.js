import plugin from "v-hotkey";
import useStore from "../store";

export default {
  mounted(el, binding) {
    const { group, keys } = binding.value;
    if (!group || !keys) {
      plugin.directive.mounted(el, binding);
      return;
    }

    const store = useStore();
    const value = {};

    Object.entries(keys).forEach(([k, { handler, description }]) => {
      store.addCombination(group, k, description);
      value[k] = handler;
    });

    plugin.directive.mounted(el, { ...binding, value });
  },
  updated(el, binding) {
    const store = useStore();

    if (binding.oldValue) {
      const { group: oldGroup, keys: oldKeys } = binding.oldValue;
      if (oldGroup && oldKeys) {
        Object.keys(oldKeys).forEach((k) => {
          store.removeCombination(oldGroup, k);
        });
      }
    }

    const { group, keys } = binding.value;
    if (!group || !keys) {
      plugin.directive.mounted(el, binding);
      return;
    }

    const value = {};

    Object.entries(keys).forEach(([k, { handler, description }]) => {
      store.addCombination(group, k, description);
      value[k] = handler;
    });

    plugin.directive.updated(el, { ...binding, value });
  },
  beforeUnmount(el, binding) {
    const store = useStore();
    const { group, keys } = binding.value;
    if (group && keys) {
      Object.keys(binding.value).forEach((k) => {
        store.removeCombination(group, k);
      });
    }

    plugin.directive.beforeUnmount(el, binding);
  },
};
