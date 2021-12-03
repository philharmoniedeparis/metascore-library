import { computed, unref, readonly } from "vue";
import { isNull, isUndefined } from "lodash";
import Opacitiable from "../../core/models/components/mixins/Opacitiable";

export default function (model) {
  if (unref(model) instanceof Opacitiable) {
    const opacity = computed(() => {
      const { opacity: value } = unref(model);

      if (!isUndefined(value) && !isNull(value)) {
        return value;
      }

      return null;
    });

    return {
      opacity: readonly(opacity),
    };
  }

  // Default value.
  return {
    opacity: null,
  };
}
