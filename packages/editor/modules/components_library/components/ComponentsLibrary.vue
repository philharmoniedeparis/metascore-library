<i18n>
{
  "fr": {
    "synched_block": "Bloc synchronisé",
    "non_synched_block": "Bloc non-synchronisé",
    "page": "Page",
    "cursor": "Élément curseur",
    "content": "Élément contenu",
    "controller": "Contrôleur",
    "video_renderer": "Rendu vidéo",
    "block_toggler": "Contrôleur de blocs",
  },
  "en": {
    "synched_block": "Synchronized block",
    "non_synched_block": "Non-synchronized block",
    "page": "Page",
    "cursor": "Cursor element",
    "content": "Content element",
    "controller": "Controller",
    "video_renderer": "Video renderer",
    "block_toggler": "Block Toggler",
  },
}
</i18n>

<template>
  <div class="components-library">
    <template v-for="model in models" :key="model.id">
      <component-library-item
        :model="model"
        :label="$t(model.name) || model.name"
      />
    </template>
  </div>
</template>

<script>
import { useStore } from "@metascore-library/core/module-manager";
import ComponentLibraryItem from "./ComponentLibraryItem.vue";

export default {
  components: {
    ComponentLibraryItem,
  },
  props: {
    modelConfigs: {
      type: Array,
      default() {
        return [
          {
            type: "Block",
            name: "synched_block",
            synched: true,
          },
          {
            type: "Block",
            name: "non_synched_block",
            synched: false,
          },
          {
            type: "Page",
            name: "page",
            position: "before",
          },
          {
            type: "Cursor",
            name: "cursor",
          },
          {
            type: "Content",
            name: "content",
          },
          {
            type: "Controller",
            name: "controller",
          },
          {
            type: "VideoRenderer",
            name: "video_renderer",
          },
          {
            type: "BlockToggler",
            name: "block_toggler",
          },
        ];
      },
    },
  },
  setup() {
    const componentsStore = useStore("components");
    return { componentsStore };
  },
  computed: {
    models() {
      return this.modelConfigs.map(this.createComponent);
    },
  },
  methods: {
    createComponent(data) {
      return this.componentsStore.create(data);
    },
  },
};
</script>

<style lang="scss" scoped>
.components-library {
  display: flex;
  position: relative;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;

  ::v-deep(.components-library-item) {
    flex: 0 0 2em;
  }
}
</style>
