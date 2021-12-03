<i18n>
{
}
</i18n>

<template>
  <component-wrapper :model="model" class="controller">
    <div class="timer">{{ mediaTime }}</div>
    <div class="buttons">
      <button type="button" data-action="rewind" @click="onRewindClick">
        <span aria-hidden="true">&laquo;</span>
        <span class="sr-only">Rewind</span>
      </button>

      <button
        v-if="mediaPlaying"
        type="button"
        data-action="pause"
        @click="onPauseClick"
      >
        <span aria-hidden="true">&laquo;</span>
        <span class="sr-only">Pause</span>
      </button>
      <button v-else type="button" data-action="play" @click="onPlayClick">
        <span aria-hidden="true">&laquo;</span>
        <span class="sr-only">Play</span>
      </button>
    </div>
  </component-wrapper>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import ComponentWrapper from "../ComponentWrapper.vue";

export default {
  components: {
    ComponentWrapper,
  },
  inject: ["seekMediaTo", "playMedia", "pauseMedia"],
  props: {
    /**
     * The associated vuex-orm model
     */
    model: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapState("media", {
      mediaPlaying: "playing",
    }),
    ...mapGetters("media", {
      mediaTime: "formattedTime",
    }),
  },
  methods: {
    onRewindClick() {
      this.seekMediaTo(0);
    },
    onPlayClick() {
      this.playMedia();
    },
    onPauseClick() {
      this.pauseMedia();
    },
  },
};
</script>

<style lang="scss" scoped>
.controller {
}
</style>
