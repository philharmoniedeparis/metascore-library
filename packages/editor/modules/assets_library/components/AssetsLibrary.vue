<i18n>
{
  "fr": {
    "upload_label": "Importer des fichiers",
    "upload_indicator_label": "Téléchargement ...",
    "spectrogram_button": "Create spectrogram image",
    "audiowaveform_button": "Create audio waveform image",
    "error": "Une erreur s’est produite. Veuillez réessayer plus tard.",
    "dropzone_text": "Déposez ici des fichiers pour les importer",
    "dropzone_maxsize_description": "Chaque fichier doit peser moins de&nbsp;: {size}",
    "dropzone_types_description": "Formats pris en charge&nbsp;: {types}",
  },
  "en": {
    "upload_label": "Import files",
    "upload_indicator_label": "Uploading...",
    "spectrogram_button": "Create spectrogram image",
    "audiowaveform_button": "Create audio waveform image",
    "error": "An error occurred. Please try again later.",
    "dropzone_text": "Drop files here to import.",
    "dropzone_maxsize_description": "File must be less than: {size}",
    "dropzone_types_description": "Supported file types: {types}",
  },
}
</i18n>

<template>
  <div
    class="assets-library"
    :class="{ dragover }"
    @dragover="onDragover"
    @dragleave="onDragleave"
    @drop.stop.prevent="onDrop"
  >
    <div class="assets-library--assets">
      <template v-for="asset in assets" :key="asset.id">
        <assets-item :asset="asset" />
      </template>
    </div>

    <div class="assets-library--imports">
      <template v-if="store.configs.uploadUrl">
        <file-control
          :accept="store.configs.uploadAccept"
          :max-size="store.configs.uploadMaxSize"
          :multiple="true"
          @update:model-value="onUploadChange"
        >
          <template #label>
            <i class="icon"><upload-icon /></i>
            {{ $t("upload_label") }}
          </template>
        </file-control>
      </template>

      <template v-if="store.canGenerateSpectrogram">
        <base-button type="button" @click="showSpectrogramForm = true">
          {{ $t("spectrogram_button") }}
          <template #icon><spectrogram-icon /></template>
        </base-button>
        <spectrogram-form
          v-if="showSpectrogramForm"
          @submit="onSpectrogramFormSubmit"
          @close="onSpectrogramFormClose"
        />
      </template>

      <template v-if="store.canGenerateAudiowaveform">
        <base-button type="button" @click="showAudiowaveformForm = true">
          {{ $t("audiowaveform_button") }}
          <template #icon><audiowaveform-icon /></template>
        </base-button>
        <audiowaveform-form
          v-if="showAudiowaveformForm"
          @submit="onAudiowaveformFormSubmit"
          @close="onAudiowaveformFormClose"
        />
      </template>
    </div>

    <div v-if="store.configs.uploadUrl" class="dropzone">
      <p v-dompurify-html="$t('dropzone_text')"></p>
      <p
        v-if="store.configs.uploadMaxSize"
        v-dompurify-html="
          $t('dropzone_maxsize_description', {
            maxsize: store.configs.uploadMaxSize,
          })
        "
      ></p>
      <p
        v-if="store.configs.uploadAccept"
        v-dompurify-html="
          $t('dropzone_types_description', {
            types: store.configs.uploadAccept,
          })
        "
      ></p>
    </div>

    <progress-indicator
      v-if="uploading || generatingSpectrogram || generatingAudiowaveform"
      :text="$t('upload_indicator_label')"
      :value="uploading ? uploadProgress : null"
      :target="uploading ? false : null"
    />

    <alert-dialog v-if="error" @close="error = null">
      {{ $t("error") }}
    </alert-dialog>
  </div>
</template>

<script>
import { buildVueDompurifyHTMLDirective } from "vue-dompurify-html";
import useStore from "../store";
import AssetsItem from "./AssetsItem.vue";
import UploadIcon from "../assets/icons/upload.svg?inline";
import SpectrogramIcon from "../assets/icons/spectrogram.svg?inline";
import SpectrogramForm from "./SpectrogramForm.vue";
import AudiowaveformIcon from "../assets/icons/audiowaveform.svg?inline";
import AudiowaveformForm from "./AudiowaveformForm.vue";

export default {
  components: {
    AssetsItem,
    UploadIcon,
    SpectrogramIcon,
    SpectrogramForm,
    AudiowaveformIcon,
    AudiowaveformForm,
  },
  directives: {
    dompurifyHtml: buildVueDompurifyHTMLDirective(),
  },
  setup() {
    const store = useStore();
    return { store };
  },
  data() {
    return {
      dragover: false,
      showSpectrogramForm: false,
      showAudiowaveformForm: false,
      error: null,
    };
  },
  computed: {
    assets() {
      return this.store.all;
    },
    uploading() {
      return this.store.uploading;
    },
    uploadProgress() {
      return this.store.uploadProgress;
    },
    generatingSpectrogram() {
      return this.store.generatingSpectrogram;
    },
    generatingAudiowaveform() {
      return this.store.generatingAudiowaveform;
    },
  },
  methods: {
    /**
     * Get the list of files being dragged.
     * @param {DataTransfer} dataTransfer The DataTransfer object.
     */
    getDraggedFiles(dataTransfer) {
      let files = [];

      // Use DataTransfer interface to access the file(s)
      if (dataTransfer.files && dataTransfer.files.length > 0) {
        for (let i = 0; i < dataTransfer.files.length; i++) {
          files.push(dataTransfer.files.item(i));
        }
      } else if (dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        for (let i = 0; i < dataTransfer.items.length; i++) {
          if (dataTransfer.items[i].kind === "file") {
            files.push(dataTransfer.items[i].getAsFile());
          }
        }
      }

      return files;
    },
    /**
     * Dragover event callback.
     * @param {Event} evt The event object.
     */
    onDragover(evt) {
      if (!this.store.configs.uploadUrl) {
        return;
      }

      const files = this.getDraggedFiles(evt.dataTransfer);
      if (files.length > 0) {
        this.dragover = true;
        evt.preventDefault();
      }
    },
    /**
     * Dragreleave event callback.
     */
    onDragleave() {
      this.dragover = false;
    },
    /**
     * Drop event callback.
     * @param {Event} evt The event object.
     */
    onDrop(evt) {
      const files = this.getDraggedFiles(evt.dataTransfer);
      this.dragover = false;
      this.store
        .upload(files)
        .then(() => {
          this.error = null;
        })
        .catch((e) => {
          this.error = e;
        });
    },
    onUploadChange(value) {
      Promise.all(
        value.map((file) => {
          return fetch(file.url).then((response) => {
            return response.blob();
          });
        })
      ).then((files) => {
        this.store
          .upload(files)
          .then(() => {
            this.error = null;
          })
          .catch((e) => {
            this.error = e;
          });
      });
    },
    onSpectrogramFormSubmit(data) {
      this.store
        .generateSpectrogram(data)
        .then(() => {
          this.showSpectrogramForm = false;
          this.error = null;
        })
        .catch((error) => {
          this.error = error;
        });
    },
    onSpectrogramFormClose() {
      this.showSpectrogramForm = false;
      this.error = null;
    },
    onAudiowaveformFormSubmit(data) {
      this.store
        .generateAudiowaveform(data)
        .then(() => {
          this.showAudiowaveformForm = false;
          this.error = null;
        })
        .catch((error) => {
          this.error = error;
        });
    },
    onAudiowaveformFormClose() {
      this.showAudiowaveformForm = false;
      this.error = null;
    },
  },
};
</script>

<style lang="scss" scoped>
.assets-library {
  display: flex;
  position: relative;
  flex-direction: column;
  height: 100%;

  .assets-library--assets {
    display: flex;
    position: relative;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;

    .assets-library--asset-item {
      flex: 0 0 auto;
    }
  }

  .assets-library--imports {
    display: flex;
    position: relative;
    flex-direction: column;

    :deep(.control.file) {
      margin: 0;
      box-sizing: border-box;
      flex: 0 0 2.5em;
      justify-content: center;

      label {
        display: flex;
        width: 100%;
        padding: 0.25em 0.5em;
        flex-direction: row;
        align-items: center;
        color: var(--color-white);
        opacity: 1;
        cursor: pointer;

        .icon {
          width: 2em;
          height: 1em;
          margin-right: 0.5em;

          svg {
            width: 100%;
            height: 100%;
          }
        }
      }

      input {
        display: none;
      }

      &:hover {
        background-color: var(--color-bg-secondary);
      }
    }

    :deep(button) {
      width: 100%;
      flex: 0 0 2.5em;
      padding: 0.25em 0.5em;
      opacity: 1;

      .icon {
        width: 2em;
        height: 1em;
      }

      &:hover {
        background-color: var(--color-bg-secondary);
      }
    }
  }

  .dropzone {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    height: 100%;
    width: 100%;
    padding: 2em;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5em;
    background: var(--color-bg-secondary);
    box-sizing: border-box;
    border: 2px #fff dashed;
    box-shadow: inset 0 0 0.5em 0 #fff;

    p {
      margin: 0;
      text-align: center;
    }
  }

  &:not(.dragover) {
    .dropzone {
      display: none;
    }
  }
}
</style>
