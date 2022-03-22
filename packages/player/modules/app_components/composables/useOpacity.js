import { computed, unref, readonly } from "vue";
import { isNull, isUndefined } from "lodash";
import { useModule } from "@metascore-library/core/services/module-manager";
import { getAnimatedValueAtTime } from "@metascore-library/core/utils/animation";

export function useOpacity(model) {
  const mediaStore = useModule("media").useStore();

  if (unref(model).constructor.$isOpacitable) {
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

export default useOpacity;
