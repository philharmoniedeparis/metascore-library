<template>
  <div class="snap-guides">
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
    guides() {
      return this.store.activeSnapTargets.map((target) => {
        return { left: `${target}px`, width: "1px", height: "100%" };
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.snap-guides {
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
