<template>
  <timecode-input v-model="time" class="playback-time" />
</template>

<script>
import { mapState, mapMutations } from "vuex";

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
        this.setMediaTime(value);
      },
    },
  },
  methods: {
    ...mapMutations("media", {
      setMediaTime: "setTime",
    }),
  },
};
</script>

<style lang="scss" scoped></style>
