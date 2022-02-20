import { computed, unref, readonly } from "vue";
import { isNull, isUndefined } from "lodash";

export default function (model) {
  if (unref(model).$isBorderable) {
    const border = computed(() => {
      const {
        "border-width": borderWidth,
        "border-color": borderColor,
        "border-radius": borderRadius,
      } = unref(model);
      const ret = {};

      if (
        !isUndefined(borderWidth) &&
        !isNull(borderWidth) &&
        borderWidth > 0
      ) {
        ret["border-style"] = "solid";
        ret["border-width"] = `${borderWidth}px`;

        if (!isUndefined(borderColor) && !isNull(borderColor)) {
          ret["border-color"] = borderColor;
        }

        if (!isUndefined(borderRadius) && !isNull(borderRadius)) {
          ret["border-radius"] = borderRadius;
        }
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
