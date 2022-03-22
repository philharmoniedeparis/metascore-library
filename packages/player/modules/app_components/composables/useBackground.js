import { computed, unref, readonly } from "vue";
import { isNull, isUndefined } from "lodash";

export function useBackground(model) {
  if (unref(model).constructor.$isBackgroundable) {
    const background = computed(() => {
      const {
        "background-color": backgroundColor,
        "background-image": backgroundImage,
      } = unref(model);
      const ret = {};

      if (!isUndefined(backgroundColor) && !isNull(backgroundColor)) {
        ret["background-color"] = backgroundColor;
      }

      if (!isUndefined(backgroundImage) && !isNull(backgroundImage)) {
        ret["background-image"] = `url(${backgroundImage})`;
      }

      return ret;
    });

    return {
      background: readonly(background),
    };
  }

  // Default value.
  return {
    background: null,
  };
}

export default useBackground;
