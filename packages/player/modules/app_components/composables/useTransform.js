import { computed, unref, readonly } from "vue";
import { isNull, isUndefined } from "lodash";
import { useStore } from "@metascore-library/core/modules/manager";
import { getAnimatedValueAtTime } from "@metascore-library/core/utils/animation";

export default function (model) {
  const mediaStore = useStore("media");

  if (unref(model).$isTransformable) {
    const transform = computed(() => {
      const mediaTime = mediaStore.time;
      const { translate, scale } = unref(model);
      const ret = {};

      if (!isUndefined(translate) && !isNull(translate)) {
        const value = !translate.animated
          ? translate.value
          : getAnimatedValueAtTime(translate.value, mediaTime);

        if (!isUndefined(value) && !isNull(value)) {
          if (value[0] !== 0) {
            ret.translateX = `${value[0]}px`;
          }
          if (value[1] !== 0) {
            ret.translateY = `${value[1]}px`;
          }
        }
      }

      if (!isUndefined(scale) && !isNull(scale)) {
        const value = !scale.aniamted
          ? scale.value
          : getAnimatedValueAtTime(scale.value, mediaTime);

        if (!isUndefined(value) && !isNull(value)) {
          if (value[0] !== 1) {
            ret.scaleX = value[0];
          }
          if (value[1] !== 1) {
            ret.scaleY = value[1];
          }
        }
      }

      return Object.entries(ret)
        .map(([key, val]) => {
          return `${key}(${val})`;
        })
        .join(" ");
    });

    return {
      transform: readonly(transform),
    };
  }

  // Default value.
  return {
    transform: null,
  };
}
