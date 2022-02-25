import { computed, unref, readonly } from "vue";
import { isNull, isUndefined } from "lodash";
import { useStore } from "@metascore-library/core/module-manager";
import { getAnimatedValueAtTime } from "@metascore-library/core/utils/animation";

export default function (model) {
  const mediaStore = useStore("media");

  if (unref(model).$isTransformable) {
    const transform = computed(() => {
      const { translate, scale } = unref(model);
      const ret = {};

      if (!isUndefined(translate) && !isNull(translate)) {
        let value = null;

        if (!translate.animated) {
          value = translate.value;
        } else {
          const mediaTime = mediaStore.time;
          value = getAnimatedValueAtTime(translate.value, mediaTime);
        }

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
        let value = null;

        if (!scale.animated) {
          value = scale.value;
        } else {
          const mediaTime = mediaStore.time;
          value = getAnimatedValueAtTime(scale.value, mediaTime);
        }

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
