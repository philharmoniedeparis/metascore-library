import { computed, unref, readonly } from "vue";
import { isNull, isUndefined } from "lodash";
import Resizable from "../models/mixins/Resizable";

export default function (model) {
  if (unref(model) instanceof Resizable) {
    const size = computed(() => {
      const { dimension: value } = unref(model);
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
