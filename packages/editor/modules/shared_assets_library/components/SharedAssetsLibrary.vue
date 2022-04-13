<template>
  <div class="shared-assets-library">
    <template v-for="asset in assets" :key="asset.id">
      <keep-alive>
        <shared-assets-item :asset="asset" @click:import="onItemImportClick" />
      </keep-alive>
    </template>
  </div>
</template>

<script>
import useStore from "../store";
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
  emits: ["click:import"],
  setup() {
    const store = useStore();
    return { store };
  },
  computed: {
    assets() {
      return this.store.filtered;
    },
    loaded() {
      return this.store.loaded;
    },
    filters() {
      return this.store.filters;
    },
  },
  async mounted() {
    if (!this.loaded) {
      await this.store.load(this.url);
    }
  },
  methods: {
    onItemImportClick(asset) {
      this.$emit("click:import", asset);
    },
  },
};
</script>

<style lang="scss" scoped>
.shared-assets-library {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(10em, 1fr));
  grid-gap: 1rem;
  padding: 1em;
  overflow: hidden;
}
</style>
