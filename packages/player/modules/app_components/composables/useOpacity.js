import { computed, unref, readonly } from "vue";
import { useStore } from "vuex";
import { isNull, isUndefined } from "lodash";
import { getAnimatedValueAtTime } from "@metascore-library/core/utils/animation";

export default function (model) {
  const store = useStore();

  if (unref(model).$isOpacitiable) {
    const opacity = computed(() => {
      const mediaTime = store.state.media.time;
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
