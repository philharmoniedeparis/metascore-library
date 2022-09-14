<template>
  <time-control v-model="time" class="playback-time" />
</template>

<script>
import { useModule } from "@metascore-library/core/services/module-manager";

export default {
  setup() {
    const { time: mediaTime, seekTo: seekMediaTo } = useModule("media_player");
    return { mediaTime, seekMediaTo };
  },
  computed: {
    time: {
      get() {
        return this.mediaTime;
      },
      set(value) {
        this.seekMediaTo(value);
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.playback-time {
  margin: 0;

  :deep(.input-wrapper) {
    height: 100%;
  }

  :deep(input) {
    width: 100%;
    height: 100%;
    padding: 0;
    font-size: 1.15em;

    &:focus {
      box-shadow: none;
    }
  }
}
</style>
