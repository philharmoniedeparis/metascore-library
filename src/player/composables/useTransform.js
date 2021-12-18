import { computed, unref, readonly } from "vue";
import { useStore } from "vuex";
import { isNull, isUndefined, isArray } from "lodash";
import { map } from "../../core/utils/Math";
import Transformable from "../../core/models/components/mixins/Transformable";

const getAnimatedValueAtTime = (values, time) => {
  // Only one value available, return it.
  if (values.length === 1) {
    return values[0][1];
  }

  // Find the index of the value with the smallest time
  // greater than the desired time.
  const index = values.findIndex((value) => {
    return value[0] >= time;
  });

  if (index === -1) {
    // No value found after desired time,
    // return the last value.
    return values[values.length - 1][1];
  }

  if (index === 0) {
    // No value found before desired time,
    // return first value.
    return values[index][1];
  }

  if (time === values[index][0]) {
    // Desired time matches a value's time,
    // return that value.
    return values[index][1];
  }

  // Claculate the intermediate.
  const start = values[index - 1];
  const end = values[index];

  if (isArray(start[1])) {
    return start[1].map((v, index) => {
      return map(time, start[0], end[0], start[1][index], end[1][index]);
    });
  }

  return map(time, start[0], end[0], start[1], end[1]);
};

export default function (model) {
  const store = useStore();

  if (unref(model) instanceof Transformable) {
    const transform = computed(() => {
      const mediaTime = store.state.media.time;
      const { translate, scale } = unref(model);
      const ret = {};

      if (!isUndefined(translate) && !isNull(translate)) {
        const value = getAnimatedValueAtTime(translate, mediaTime);
        ret.translateX = `${value[0]}px`;
        ret.translateY = `${value[1]}px`;
      }

      if (!isUndefined(scale) && !isNull(scale)) {
        const value = getAnimatedValueAtTime(scale, mediaTime);
        ret.scaleX = value[0];
        ret.scaleY = value[1];
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
