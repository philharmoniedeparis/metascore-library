import { computed, readonly } from "vue";
import { useStore } from "vuex";
import { isNull, isUndefined } from "@/core/utils/Var";

export default function (model) {
  const active = computed(() => {
    const store = useStore();
    const mediaTime = store.state.media.time;
    const { "start-time": startTime, "end-time": endTime } = model.value;

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
      return mediaTime <= endTime;
    }

    return (
      mediaTime.value >= startTime.value && mediaTime.value <= endTime.value
    );
  });

  return {
    active: readonly(active),
  };
}
