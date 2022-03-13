<template>
  <timecode-input v-model="mediaTime" class="playback-time" />
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
  ::v-deep(input) {
    width: 100%;

    &:focus {
      box-shadow: none;
    }
  }
}
</style>
