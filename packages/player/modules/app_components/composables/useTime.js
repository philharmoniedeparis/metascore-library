import { computed, unref, readonly } from "vue";
import { useStore } from "@metascore-library/core/module-manager";
import { isNull, isUndefined } from "lodash";

export default function (model) {
  if (unref(model).$isTimeable) {
    const active = computed(() => {
      const { "start-time": startTime, "end-time": endTime } = unref(model);

      if (
        (isUndefined(startTime) || isNull(startTime)) &&
        (isUndefined(endTime) || isNull(endTime))
      ) {
        return true;
      }

      const mediaStore = useStore("media");
      const mediaTime = mediaStore.time;
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
