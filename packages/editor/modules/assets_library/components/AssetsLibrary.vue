<template>
  <div class="assets-library">
    <template v-for="asset in assets" :key="asset.id">
      <assets-item :asset="asset" />
    </template>

    <styled-button
      type="button"
      title="Create spectrogram image"
      @click="showSpectrogramForm = true"
    >
      <template #icon><spectrogram-icon /></template>
    </styled-button>
    <spectrogram-form
      v-if="showSpectrogramForm"
      @submit="onSpectrogramFormSubmit"
      @close="showSpectrogramForm = false"
    />

    <styled-button
      type="button"
      title="Create audio waveform image"
      @click="showWaveformForm = true"
    >
      <template #icon><waveform-icon /></template>
    </styled-button>
    <waveform-form
      v-if="showWaveformForm"
      @submit="onWaveformFormSubmit"
      @close="showWaveformForm = false"
    />
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
  overflow-y: auto;

  ::v-deep(.assets-library-item) {
    flex: 0 0 2em;
  }
}
</style>
