import { computed, unref, readonly } from "vue";
import { isNull, isUndefined } from "lodash";

export default function (model) {
  if (unref(model).$isHideable) {
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
