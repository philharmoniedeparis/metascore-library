<template>
  <context-menu class="metaScore-player">
    <app-renderer
      :url="url"
      :responsive="responsive"
      :allow-upscaling="allowUpscaling"
    />

    <template #footer>
      {{ `metaScore Player ${version}` }}
    </template>
  </context-menu>
</template>

<script>
import useEditorStore from "@metascore-library/editor/store";
import packageInfo from "../../package.json";

export default {
  props: {
    url: {
      type: String,
      required: true,
    },
    keyboard: {
      type: Boolean,
      default: true,
    },
    responsive: {
      type: Boolean,
      default: false,
    },
    allowUpscaling: {
      type: Boolean,
      default: false,
    },
    api: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const editorStore = useEditorStore();
    return { editorStore };
  },
  date() {
    return {
      version: packageInfo.version,
    };
  },
  async mounted() {
    await this.editorStore.load(this.url);
  },
};
</script>
