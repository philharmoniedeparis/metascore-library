<i18n>
{
  "fr": {
    "spectrogram_button": "Create spectrogram image",
    "waveform_button": "Create audio waveform image",
  },
  "en": {
    "spectrogram_button": "Create spectrogram image",
    "waveform_button": "Create audio waveform image",
  },
}
</i18n>

<template>
  <div class="assets-library">
    <div class="assets-library--assets">
      <template v-for="asset in assets" :key="asset.id">
        <assets-item :asset="asset" />
      </template>
    </div>

    <div class="assets-library--imports">
      <styled-button type="button" @click="showSpectrogramForm = true">
        {{ $t("spectrogram_button") }}
        <template #icon><spectrogram-icon /></template>
      </styled-button>
      <spectrogram-form
        v-if="showSpectrogramForm"
        @submit="onSpectrogramFormSubmit"
        @close="showSpectrogramForm = false"
      />

      <styled-button type="button" @click="showWaveformForm = true">
        {{ $t("waveform_button") }}
        <template #icon><waveform-icon /></template>
      </styled-button>
      <waveform-form
        v-if="showWaveformForm"
        @submit="onWaveformFormSubmit"
        @close="showWaveformForm = false"
      />
    </div>
  </div>
</template>

<script>
import { useStore } from "@metascore-library/core/module-manager";
import AssetsItem from "./AssetsItem.vue";
import SpectrogramIcon from "../assets/icons/spectrogram.svg?inline";
import SpectrogramForm from "./SpectrogramForm.vue";
import WaveformIcon from "../assets/icons/waveform.svg?inline";
import WaveformForm from "./WaveformForm.vue";

export default {
  components: {
    AssetsItem,
    SpectrogramIcon,
    SpectrogramForm,
    WaveformIcon,
    WaveformForm,
  },
  setup() {
    const store = useStore("assets");
    return { store };
  },
  data() {
    return {
      showSpectrogramForm: false,
      showWaveformForm: false,
    };
  },
  computed: {
    assets() {
      return this.store.all;
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

    ::v-deep(button) {
      width: 100%;
      flex: 0 0 2.5em;
      padding: 0.25em 0.5em;
      color: $white;
      opacity: 1;

      .icon {
        width: 2em;
      }

      &:hover {
        background-color: $mediumgray;
      }
    }
  }
}
</style>
