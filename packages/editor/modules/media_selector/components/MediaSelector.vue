<template>
  <div v-if="mediaSource" class="media-selector">
    <styled-button type="button" @click="showForm = true">
      {{ mediaSource.name }}
    </styled-button>

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
    const { source: mediaSource, setSource: setMediaSource } =
      useModule("media_player");
    return { mediaSource, setMediaSource };
  },
  data() {
    return {
      showForm: false,
    };
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

      this.setMediaSource(source);

      this.showForm = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.media-selector {
  ::v-deep(.styled-button) {
    display: block;
    width: 100%;
    padding: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    user-select: none;
  }
}
</style>
