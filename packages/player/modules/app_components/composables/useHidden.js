import { computed, unref, readonly } from "vue";
import { isNull, isUndefined } from "lodash";

export function useHidden(model) {
  if (unref(model).constructor.$isHideable) {
    const hidden = computed(() => {
      const { hidden: value } = unref(model);

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
