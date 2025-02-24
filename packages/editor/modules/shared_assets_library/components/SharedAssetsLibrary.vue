<i18n>
{
  "fr": {
    "loading_indicator_label": "Chargement ...",
  },
  "en": {
    "loading_indicator_label": "Loading...",
  },
}
</i18n>

<template>
  <div class="shared-assets-library">
    <template v-for="asset in assets" :key="asset.id">
      <shared-assets-item :asset="asset" @click:import="onItemImportClick" />
    </template>

    <progress-indicator v-if="loading" :text="$t('loading_indicator_label')" :target="false" />
  </div>
</template>

<script>
import useStore from "../store";
import SharedAssetsItem from "./SharedAssetsItem.vue";

export default {
  components: {
    SharedAssetsItem,
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
    loading() {
      return this.store.loading;
    },
    filters() {
      return this.store.filters;
    },
  },
  mounted() {
    if (!this.loaded) {
      this.store.load();
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
