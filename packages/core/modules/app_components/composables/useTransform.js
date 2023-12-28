import { computed, unref, readonly } from "vue";
import { isNull, isUndefined } from "lodash";
import { useModule } from "@metascore-library/core/services/module-manager";
import { getAnimatedValueAtTime, getSortedKeyframes } from "../utils/animation";

export default function (component, model) {
  const { time: mediaTime } = useModule("media_player");

  if (unref(model).$isTransformable) {
    const sortedTransformValue = getSortedKeyframes(component, "translate");
    const sortedScaleValue = getSortedKeyframes(component, "scale");
    const sortedRotateValue = getSortedKeyframes(component, "rotate");

    const transform = computed(() => {
      const { translate, scale, rotate } = unref(component);
      const ret = {};

      if (!isUndefined(translate) && !isNull(translate)) {
        let value = null;

        if (!translate.animated) {
          value = translate.value;
        } else {
          value = getAnimatedValueAtTime(
            unref(sortedTransformValue),
            unref(mediaTime)
          );
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
          value = getAnimatedValueAtTime(
            unref(sortedScaleValue),
            unref(mediaTime)
          );
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

      if (!isUndefined(rotate) && !isNull(rotate)) {
        let value = null;

        if (!rotate.animated) {
          value = rotate.value;
        } else {
          value = getAnimatedValueAtTime(
            unref(sortedRotateValue),
            unref(mediaTime)
          );
        }

        if (!isUndefined(value) && !isNull(value)) {
          ret.rotate = `${value % 360}deg`;
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
