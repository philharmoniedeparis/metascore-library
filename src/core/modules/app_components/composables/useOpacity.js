import { computed, unref, readonly } from "vue";
import { isNull, isUndefined } from "lodash";
import { useModule } from "@core/services/module-manager";
import { getAnimatedValueAtTime } from "../utils/animation";

export default function (component, model) {
  const { time: mediaTime } = useModule("media_player");

  if (unref(model).$isOpacitable) {
    const opacity = computed(() => {
      const { opacity } = unref(component);
      let value = null;

      if (!isUndefined(opacity) && !isNull(opacity)) {
        if (!opacity.animated) {
          value = opacity.value;
        } else {
          const time = unref(mediaTime);
          value = getAnimatedValueAtTime(opacity.value, time);
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
