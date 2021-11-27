<i18n>
{
}
</i18n>

<template>
  <div
    v-show="active"
    :class="['metaScore-component', 'video-renderer', { active }]"
  >
    <canvas ref="canvas" />
  </div>
</template>

<script>
import { computed } from "vue";
import { mapState } from "vuex";
import useCuePoint from "@/player/composables/useCuePoint";

export default {
  inject: ["getMedia"],
  props: {
    /**
     * The associated vuex-orm model
     */
    model: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const startTime = computed(() => props.model["start-time"]);
    const endTime = computed(() => props.model["end-time"]);
    return {
      ...useCuePoint(startTime, endTime),
    };
  },
  computed: {
    ...mapState("media", {
      mediaReady: "ready",
      mediaTime: "time",
    }),
    canvas() {
      return this.$refs.canvas;
    },
    context() {
      return this.canvas.getContext("2d");
    },
  },
  watch: {
    active() {
      this.update();
    },
    mediaReady() {
      this.update();
    },
    mediaTime() {
      this.update();
    },
  },
  mounted() {
    this.update();
  },
  methods: {
    update() {
      if (!this.active) {
        return;
      }

      const media_el = this.getMedia().getElement();
      if (media_el instanceof HTMLVideoElement) {
        try {
          this.canvas.width = media_el.videoWidth;
          this.canvas.height = media_el.videoHeight;

          this.context.drawImage(media_el, 0, 0);
        } catch (e) {
          console.error(e);
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
