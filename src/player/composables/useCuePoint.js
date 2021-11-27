import { computed, readonly } from "vue";
import { useStore } from "vuex";

export default function useCuePoint(startTime, endTime) {
  const store = useStore();

  const mediaTime = computed(() => store.state.media.time);
  const active = computed(() => {
    if (
      (typeof startTime === "undefined" || startTime.value === null) &&
      (typeof endTime === "undefined" || endTime.value === null)
    ) {
      return true;
    }

    if (typeof endTime === "undefined" || endTime.value === null) {
      return mediaTime.value >= startTime.value;
    }

    if (typeof startTime === "undefined" || startTime.value === null) {
      return mediaTime.value <= endTime.value;
    }

    return (
      mediaTime.value >= startTime.value && mediaTime.value <= endTime.value
    );
  });

  return {
    active: readonly(active),
  };
}
