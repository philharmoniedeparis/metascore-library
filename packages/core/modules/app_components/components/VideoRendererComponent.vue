<template>
  <component-wrapper :component="component">
    <canvas ref="canvas" />
  </component-wrapper>
</template>

<script>
import { useModule } from "@metascore-library/core/services/module-manager";

export default {
  props: {
    /**
     * The associated component
     */
    component: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const {
      element: mediaElement,
      type: mediaType,
      ready: mediaReady,
      width: mediaWidth,
      height: mediaHeight,
      time: mediaTime,
    } = useModule("media_player");
    return {
      mediaElement,
      mediaType,
      mediaReady,
      mediaWidth,
      mediaHeight,
      mediaTime,
    };
  },
  computed: {
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
