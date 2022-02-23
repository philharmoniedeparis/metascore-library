import { computed, unref, readonly } from "vue";
import { isNull, isUndefined } from "lodash";
import { useStore } from "@metascore-library/core/modules/manager";
import { getAnimatedValueAtTime } from "@metascore-library/core/utils/animation";

export default function (model) {
  const mediaStore = useStore("media");

  if (unref(model).$isOpacitable) {
    const opacity = computed(() => {
      const mediaTime = mediaStore.time;
      const { opacity } = unref(model);

      if (!isUndefined(opacity) && !isNull(opacity)) {
        const value = !opacity.animated
          ? opacity.value
          : getAnimatedValueAtTime(opacity.value, mediaTime);

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
