import { computed, unref, readonly } from "vue";
import { isNull, isUndefined } from "lodash";

export function useHidden(component, model) {
  if (unref(model).$isHideable) {
    const hidden = computed(() => {
      const { hidden: value } = unref(component);

      if (!isUndefined(value) && !isNull(value)) {
        return value;
      }

      return false;
    });

    return {
      hidden: readonly(hidden),
    };
  }

  // Default value.
  return {
    hidden: null,
  };
}

export default useHidden;
