export default {
  mounted(el, binding) {
    if (binding.value !== false) {
      el.focus();
    }
  },
};
