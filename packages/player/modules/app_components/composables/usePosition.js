import { computed, unref, readonly } from "vue";
import { isNull, isUndefined } from "lodash";

export function usePosition(model) {
  if (unref(model).constructor.$isPositionable) {
    const position = computed(() => {
      const { position: value } = unref(model);
      const ret = {};

      if (!isUndefined(value) && !isNull(value)) {
        ret.left = `${value[0]}px`;
        ret.top = `${value[1]}px`;
      }

      return ret;
    });

    return {
      position: readonly(position),
    };
  }

  // Default value.
  return {
    position: null,
  };
}

export default usePosition;
