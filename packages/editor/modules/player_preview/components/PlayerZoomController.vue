<template>
  <form class="player-zoom-controller">
    <select-control v-model="zoom" :options="options" />
  </form>
</template>

<script>
import { useStore } from "@metascore-library/core/services/module-manager";

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
    const store = useStore("player-preview");
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

<style lang="scss" scoped>
.player-zoom-controller {
  ::v-deep(.form-group) {
    margin: 0;
  }
}
</style>
