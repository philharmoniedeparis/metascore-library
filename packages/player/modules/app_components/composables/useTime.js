import { computed, unref, readonly } from "vue";
import { useStore } from "vuex";
import { isNull, isUndefined } from "lodash";

export default function (model) {
  const store = useStore();

  if (unref(model).$isTimeable) {
    const active = computed(() => {
      const mediaTime = store.state.media.time;
      const { "start-time": startTime, "end-time": endTime } = unref(model);

      if (
        (isUndefined(startTime) || isNull(startTime)) &&
        (isUndefined(endTime) || isNull(endTime))
      ) {
        return true;
      }

      if (isUndefined(endTime) || isNull(endTime)) {
        return mediaTime >= startTime;
      }

      if (isUndefined(startTime) || isNull(startTime)) {
        return mediaTime < endTime;
      }

      return unref(mediaTime) >= startTime && unref(mediaTime) < endTime;
    });

    return {
      active: readonly(active),
    };
  }

  // Default value.
  return {
    active: true,
  };
}
