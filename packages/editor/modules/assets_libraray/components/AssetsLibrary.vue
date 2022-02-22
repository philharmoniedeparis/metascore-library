<template>
  <div class="assets-library">
    <template v-for="(asset, id) in assets" :key="id">
      <assets-library-item :asset="asset" />
    </template>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import AssetsLibraryItem from "./AssetsLibraryItem.vue";

export default {
  components: {
    AssetsLibraryItem,
  },
  computed: {
    ...mapGetters("assets", { assets: "getAll" }),
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
