import useStore from "../store";

export default {
  mounted(el, binding) {
    el._contextmenuDirectiveListener = () => {
      const store = useStore();
      store.addItems(binding.value);
    };

    if (binding.value !== false) {
      el.addEventListener("contextmenu", el._contextmenuDirectiveListener);
    } else {
      el.removeEventListener("contextmenu", el._contextmenuDirectiveListener);
    }
  },
  beforeUnmount(el) {
    el.removeEventListener("contextmenu", el._contextmenuDirectiveListener);
  },
};
