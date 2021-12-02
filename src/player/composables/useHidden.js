import { computed, unref, readonly } from "vue";
import { isNull, isUndefined } from "lodash";
import Timeable from "../../core/models/components/mixins/Hideable";

export default function (model) {
  if (unref(model) instanceof Timeable) {
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
