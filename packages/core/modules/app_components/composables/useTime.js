import { computed, unref, readonly } from "vue";
import { useModule } from "@core/services/module-manager";
import { isNull, isUndefined } from "lodash";

export default function (component, model) {
  if (unref(model).$isTimeable) {
    const { time: mediaTime } = useModule("media_player");

    const active = computed(() => {
      const time = unref(mediaTime);
      const { "start-time": startTime, "end-time": endTime } = unref(component);

      if (
        (isUndefined(startTime) || isNull(startTime)) &&
        (isUndefined(endTime) || isNull(endTime))
      ) {
        return true;
      }

      if (isUndefined(endTime) || isNull(endTime)) {
        return time >= startTime;
      }

      if (isUndefined(startTime) || isNull(startTime)) {
        return time < endTime;
      }

      return time >= startTime && time < endTime;
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
