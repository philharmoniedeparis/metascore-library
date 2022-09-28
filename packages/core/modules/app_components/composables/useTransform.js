import { computed, unref, readonly } from "vue";
import { isNull, isUndefined } from "lodash";
import { useModule } from "@metascore-library/core/services/module-manager";
import { getAnimatedValueAtTime } from "@metascore-library/core/utils/animation";

export default function (component, model) {
  const { time: mediaTime } = useModule("media_player");

  if (unref(model).$isTransformable) {
    const transform = computed(() => {
      const { translate, scale } = unref(component);
      const ret = {};

      if (!isUndefined(translate) && !isNull(translate)) {
        let value = null;

        if (!translate.animated) {
          value = translate.value;
        } else {
          const time = unref(mediaTime);
          value = getAnimatedValueAtTime(translate.value, time);
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
          const time = unref(mediaTime);
          value = getAnimatedValueAtTime(scale.value, time);
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
