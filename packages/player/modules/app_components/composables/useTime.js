import { computed, unref, readonly } from "vue";
import { useModule } from "@metascore-library/core/services/module-manager";
import { isNull, isUndefined } from "lodash";

export function useTime(model) {
  if (unref(model).constructor.$isTimeable) {
    const active = computed(() => {
      const { "start-time": startTime, "end-time": endTime } = unref(model);

      if (
        (isUndefined(startTime) || isNull(startTime)) &&
        (isUndefined(endTime) || isNull(endTime))
      ) {
        return true;
      }

      const mediaStore = useModule("media").useStore();
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

export default useTime;
