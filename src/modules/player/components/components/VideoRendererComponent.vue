<i18n>
{
}
</i18n>

<template>
  <component-wrapper :model="model" class="video-renderer">
    <canvas ref="canvas" />
  </component-wrapper>
</template>

<script>
import { mapState } from "vuex";

export default {
  inject: ["getMediaElement"],
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
      if (!this.mediaReady) {
        return;
      }

      const media_el = this.getMediaElement();
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

<style lang="scss" scoped>
.video-renderer {
  background-color: rgb(0, 0, 0);
  border: 0 solid rgb(0, 0, 0);
  border-radius: 10px;
  overflow: hidden;

  canvas {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}
</style>
