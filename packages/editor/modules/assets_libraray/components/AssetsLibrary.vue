<template>
  <div class="assets-library">
    <template v-for="(item, index) in items" :key="index">
      <assets-library-item :asset="item" />
    </template>
  </div>
</template>

<script>
import { mapState } from "vuex";
import AssetsLibraryItem from "./AssetsLibraryItem.vue";

export default {
  components: {
    AssetsLibraryItem,
  },
  computed: {
    ...mapState("assets", ["items"]),
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
