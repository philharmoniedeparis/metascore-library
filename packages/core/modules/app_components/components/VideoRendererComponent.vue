<template>
  <component-wrapper :component="component">
    <canvas ref="canvas" />
  </component-wrapper>
</template>

<script>
import { toRef } from "vue";
import useStore from "../store";
import { useModule } from "@metascore-library/core/services/module-manager";
import useTime from "../composables/useTime";

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
  setup(props) {
    const store = useStore();
    const component = toRef(props, "component");
    const model = store.getModelByType(component.value.type);

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
      ...useTime(component, model),
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
      if (!this.mediaReady || !this.active) return;

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
  overflow: hidden;

  canvas {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}
</style>
