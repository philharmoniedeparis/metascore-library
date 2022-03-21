<template>
  <div v-if="mediaSource" class="media-selector">
    <button type="button" @click="showForm = true">
      {{ mediaSource.name }}
    </button>

    <media-source-form
      v-if="showForm"
      @submit="onFormSubmit"
      @close="showForm = false"
    />
  </div>
</template>

<script>
import useEditorStore from "@metascore-library/editor/store";
import MediaSourceForm from "./MediaSourceForm";
import { getMimeTypeFromURL } from "@metascore-library/core/utils/media";

export default {
  components: {
    MediaSourceForm,
  },
  setup() {
    const editorStore = useEditorStore();
    return { editorStore };
  },
  data() {
    return {
      showForm: false,
    };
  },
  computed: {
    mediaSource() {
      return this.editorStore.mediaSource;
    },
  },
  methods: {
    onFormSubmit({ file, url }) {
      let source = null;

      if (file) {
        source = {
          ...file,
          source: "upload",
        };
      } else if (url) {
        source = {
          name: new URL(url).pathname.split("/").pop(),
          url,
          mime: getMimeTypeFromURL(url),
          source: "url",
        };
      }

      this.editorStore.setMediaSource(source);

      this.showForm = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.media-selector {
  button {
    width: 100%;
    color: $white;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    user-select: none;
  }
}
</style>
