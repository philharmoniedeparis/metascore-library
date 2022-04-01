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
    <template v-for="(item, index) in items" :key="index">
      <component-library-item
        :component="item"
        :label="$t(item.name) || item.name"
      />
    </template>
  </div>
</template>

<script>
import useEditorStore from "@metascore-library/editor/store";
import ComponentLibraryItem from "./ComponentLibraryItem.vue";

export default {
  components: {
    ComponentLibraryItem,
  },
  props: {
    items: {
      type: Array,
      default() {
        return [
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
    const editorStore = useEditorStore();
    return { editorStore };
  },
};
</script>

<style lang="scss" scoped>
.components-library {
  display: flex;
  position: relative;
  flex-direction: column;
  background: $mediumgray;
  overflow-y: auto;

  ::v-deep(.components-library--item) {
    flex: 0 0 auto;

    &.synched_block {
      margin-top: 2px;
    }
  }
}
</style>
