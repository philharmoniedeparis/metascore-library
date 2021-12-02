import { computed, unref, readonly } from "vue";
import { isNull, isUndefined } from "lodash";
import Borderable from "../../core/models/components/mixins/Borderable";

export default function (model) {
  if (unref(model) instanceof Borderable) {
    const border = computed(() => {
      const {
        "border-width": borderWidth,
        "border-color": borderColor,
        "border-radius": borderRadius,
      } = unref(model);
      const ret = {};

      if (!isUndefined(borderWidth) && !isNull(borderWidth)) {
        ret["border-width"] = `${borderWidth}px`;
      }

      if (!isUndefined(borderColor) && !isNull(borderColor)) {
        ret["border-color"] = borderColor;
      }

      if (!isUndefined(borderRadius) && !isNull(borderRadius)) {
        ret["border-radius"] = borderRadius;
      }

      return ret;
    });

    return {
      border: readonly(border),
    };
  }

  // Default value.
  return {
    border: null,
  };
}
