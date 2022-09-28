import { computed, unref, readonly } from "vue";
import { isNull, isUndefined } from "lodash";

export default function (component, model) {
  if (unref(model).$isResizable) {
    const size = computed(() => {
      const { dimension: value } = unref(component);
      const ret = {};

      if (!isUndefined(value) && !isNull(value)) {
        ret.width = `${value[0]}px`;
        ret.height = `${value[1]}px`;
      }

      return ret;
    });

    return {
      size: readonly(size),
    };
  }

  // Default value.
  return {
    size: null,
  };
}
