<template>
  <div class="assets-library">
    <template v-for="asset in assets" :key="asset.id">
      <assets-item :asset="asset" />
    </template>
  </div>
</template>

<script>
import { useStore } from "@metascore-library/core/module-manager";
import AssetsItem from "./AssetsItem.vue";

export default {
  components: {
    AssetsItem,
  },
  setup() {
    const store = useStore("assets");
    return { store };
  },
  computed: {
    assets() {
      return this.store.all;
    },
  },
};
</script>

<style lang="scss" scoped>
.assets-library {
  display: flex;
  position: relative;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;

  ::v-deep(.assets-library-item) {
    flex: 0 0 2em;
  }
}
</style>
