<template>
  <div class="shared-assets-library">
    <template v-for="(asset, id) in assets" :key="id">
      <shared-assets-item :asset="asset" />
    </template>
  </div>
</template>

<script>
import { useStore } from "@metascore-library/core/modules/manager";
import SharedAssetsItem from "./SharedAssetsItem.vue";

export default {
  components: {
    SharedAssetsItem,
  },
  props: {
    url: {
      type: String,
      required: true,
    },
  },
  setup() {
    const store = useStore("shared-assets");
    return { store };
  },
  computed: {
    assets() {
      return this.store.all;
    },
    loaded() {
      return this.store.loaded;
    },
  },
  async mounted() {
    if (!this.loaded) {
      await this.store.load(this.url);
    }
  },
};
</script>

<style lang="scss" scoped>
.shared-assets-library {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(10em, 1fr));
  grid-gap: 1rem;
  padding: 1em;
  overflow-y: auto;
}
</style>
