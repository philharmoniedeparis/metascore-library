<i18n>
  {
    "fr": {
      "title": "Zoom"
    },
    "en": {
      "title": "Zoom"
    }
  }
</i18n>

<template>
  <select-control
    v-model="zoom"
    v-tooltip
    :options="options"
    :title="$t('title')"
    class="app-zoom-controller"
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
      return this.zoomLevels.map((level) => {
        return {
          label: `${level * 100}%`,
          value: level,
        };
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.app-zoom-controller {
  :deep(select) {
    text-align: center;
  }
}
</style>
