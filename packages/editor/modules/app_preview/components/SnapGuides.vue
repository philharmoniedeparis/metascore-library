<template>
  <div class="preview-snap-guides">
    <div v-for="(guide, index) in guides" :key="index" class="guide" :style="guide" />
  </div>
</template>

<script>
import useStore from "../store";

export default {
  props: {
    color: {
      type: String,
      default: "rgba(255, 0, 0, 0.5)",
    },
  },
  setup() {
    const store = useStore();
    return {
      store,
    };
  },
  computed: {
    zoom() {
      return this.store.zoom;
    },
    offsetRect() {
      return this.store.appRendererWrapperRect;
    },
    guides() {
      const guides = [];

      this.store.activeSnapTargets.forEach((target) => {
        const { x: offsetX, y: offsetY } = this.offsetRect;

        if ("x" in target) {
          guides.push({
            left: `${(target.x - offsetX) / this.zoom}px`,
            width: "1px",
            height: "100%",
          });
        }

        if ("y" in target) {
          guides.push({
            top: `${(target.y - offsetY) / this.zoom}px`,
            width: "100%",
            height: "1px",
          });
        }
      });

      return guides;
    },
  },
};
</script>

<style lang="scss" scoped>
.preview-snap-guides {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;

  .guide {
    position: absolute;
    top: 0;
    left: 0;
    background-color: v-bind(color);
  }
}
</style>
