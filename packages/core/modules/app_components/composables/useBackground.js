import { computed, unref, readonly } from "vue";
import { isNull, isUndefined } from "lodash";

export default function (component, model) {
  if (unref(model).$isBackgroundable) {
    const background = computed(() => {
      const {
        "background-color": backgroundColor,
        "background-image": backgroundImage,
      } = unref(component);
      const ret = {};

      if (!isUndefined(backgroundColor) && !isNull(backgroundColor)) {
        ret["background-color"] = backgroundColor;
      }

      if (backgroundImage) {
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
