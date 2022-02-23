<template>
  <context-menu class="metaScore-player">
    <app-renderer :url="url" :api="api" />

    <template #footer>
      {{ `metaScore Player ${version}` }}
    </template>
  </context-menu>
</template>

<script>
import { useStore } from "@metascore-library/core/modules/manager";
import packageInfo from "../../package.json";

export default {
  props: {
    url: {
      type: String,
      required: true,
    },
    api: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const editorStore = useStore("editor");
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
