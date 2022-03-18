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
import { useModule } from "@metascore-library/core/services/module-manager";
import MediaSourceForm from "./MediaSourceForm";
import { getMimeTypeFromURL } from "@metascore-library/core/utils/media";

export default {
  components: {
    MediaSourceForm,
  },
  setup() {
    const mediaStore = useModule("Media").useStore();
    return { mediaStore };
  },
  data() {
    return {
      showForm: false,
    };
  },
  computed: {
    mediaSource() {
      return this.mediaStore.source;
    },
  },
  methods: {
    setMediaSource(source) {
      this.mediaStore.source = source;
    },
    onFormSubmit({ file, url }) {
      if (file) {
        const { name, size, type: mime } = file;

        this.setMediaSource({
          name,
          size,
          url: URL.createObjectURL(file),
          mime,
          source: "upload",
          file,
        });
      } else if (url) {
        const pathname = new URL(url).pathname;
        const mime = getMimeTypeFromURL(url);

        this.setMediaSource({
          name: pathname.split("/").pop(),
          url,
          mime,
          source: "url",
        });
      }

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
