<template>
  <div class="preview-snap-guides">
    <div
      v-for="(guide, index) in snapGuides"
      :key="index"
      class="guide"
      :style="guide"
    />
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
    snapGuides() {
      const guides = [];

      this.store.snapTargets.forEach((target) => {
        if ("x" in target) {
          guides.push({ left: `${target.x}px`, width: "1px", height: "100%" });
        }
        if ("y" in target) {
          guides.push({ top: `${target.y}px`, width: "100%", height: "1px" });
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
