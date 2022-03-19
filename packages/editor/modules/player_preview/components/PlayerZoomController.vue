<template>
  <select-control
    v-model="zoom"
    :options="options"
    class="player-zoom-controller"
  />
</template>

<script>
import useStore from "../store";

export default {
  props: {
    zoomLevels: {
      type: Array,
      default() {
        return [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 4.0];
      },
    },
  },
  setup() {
    const store = useStore();
    return { store };
  },
  computed: {
    zoom: {
      get() {
        return this.store.zoom;
      },
      set(value) {
        this.store.zoom = value;
      },
    },
    options() {
      return this.zoomLevels.reduce(
        (acc, z) => ({ ...acc, [`${z * 100}%`]: z }),
        {}
      );
    },
  },
};
</script>
