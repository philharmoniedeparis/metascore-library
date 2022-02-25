import { computed, unref, readonly } from "vue";
import { isNull, isUndefined } from "lodash";
import { useStore } from "@metascore-library/core/module-manager";
import { getAnimatedValueAtTime } from "@metascore-library/core/utils/animation";

export default function (model) {
  const mediaStore = useStore("media");

  if (unref(model).$isOpacitable) {
    const opacity = computed(() => {
      const { opacity } = unref(model);
      let value = null;

      if (!isUndefined(opacity) && !isNull(opacity)) {
        if (!opacity.animated) {
          value = opacity.value;
        } else {
          const mediaTime = mediaStore.time;
          value = getAnimatedValueAtTime(opacity.value, mediaTime);
        }

        if (!isUndefined(value) && !isNull(value)) {
          return value;
        }
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
