<template>
  <time-control v-model="mediaTime" class="playback-time" />
</template>

<script>
import { useStore } from "@metascore-library/core/services/module-manager";

export default {
  setup() {
    const mediaStore = useStore("media");
    return { mediaStore };
  },
  computed: {
    mediaTime: {
      get() {
        return this.mediaStore.time;
      },
      set(value) {
        this.mediaStore.seekTo(value);
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.playback-time {
  margin: 0;

  ::v-deep(.input-wrapper) {
    height: 100%;

    .timecode-input {
      height: 100%;
    }
  }

  ::v-deep(input) {
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
