<i18n>
{
  "fr": {
    "synched_block": "Bloc synchronisé",
    "non_synched_block": "Bloc non-synchronisé",
    "page": "Page",
    "cursor": "Curseur",
    "content": "Texte",
    "controller": "Contrôleur",
    "video_renderer": "Rendu vidéo",
    "block_toggler": "Contrôleur de blocs",
  },
  "en": {
    "synched_block": "Synchronized block",
    "non_synched_block": "Non-synchronized block",
    "page": "Page",
    "cursor": "Cursor",
    "content": "Text",
    "controller": "Controller",
    "video_renderer": "Video renderer",
    "block_toggler": "Block Toggler",
  },
}
</i18n>

<template>
  <div class="components-library">
    <template v-for="(item, index) in items" :key="index">
      <component-library-item :component="item" :label="item.name" />
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
  setup() {
    const editorStore = useEditorStore();
    return { editorStore };
  },
  computed: {
    items() {
      return [
        {
          type: "Cursor",
          name: this.$t("cursor"),
        },
        {
          type: "Content",
          name: this.$t("content"),
        },
        {
          type: "Controller",
          name: this.$t("controller"),
        },
        {
          type: "VideoRenderer",
          name: this.$t("video_renderer"),
        },
        {
          type: "Block",
          name: this.$t("synched_block"),
          synched: true,
        },
        {
          type: "Block",
          name: this.$t("non_synched_block"),
          synched: false,
        },
        {
          type: "Page",
          name: this.$t("page"),
        },
        {
          type: "BlockToggler",
          name: this.$t("block_toggler"),
        },
      ];
    },
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
