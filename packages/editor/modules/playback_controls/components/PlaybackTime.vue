<template>
  <timecode-input v-model="time" class="playback-time" />
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  computed: {
    ...mapState("media", {
      mediaTime: "time",
    }),
    time: {
      get() {
        return this.mediaTime;
      },
      set(value) {
        this.seekMediaTo(value);
      },
    },
  },
  methods: {
    ...mapActions("media", {
      seekMediaTo: "seekTo",
    }),
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
