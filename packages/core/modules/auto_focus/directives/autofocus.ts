import type { Directive } from "vue";

export default <Directive<HTMLOrSVGElement, boolean>> {
  mounted(el, binding) {
    if (binding.value !== false) {
      el.focus();
    }
  },
};
