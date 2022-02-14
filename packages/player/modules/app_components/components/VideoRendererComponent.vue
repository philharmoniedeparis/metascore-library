<template>
  <component-wrapper :model="model" class="video-renderer">
    <canvas ref="canvas" />
  </component-wrapper>
</template>

<script>
import { mapState } from "vuex";

export default {
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
      mediaElement: "element",
      mediaReady: "ready",
      mediaTime: "time",
      mediaType: "type",
      mediaWidth: "width",
      mediaHeight: "height",
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

      if (this.mediaType === "video") {
        try {
          this.canvas.width = this.mediaWidth;
          this.canvas.height = this.mediaHeight;
          this.context.drawImage(this.mediaElement, 0, 0);
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
