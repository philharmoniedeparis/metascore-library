import { defineStore } from "pinia";
import { useModule } from "@core/services/module-manager";
import * as api from "../api";

export default defineStore("assets-library", {
  state: () => {
    return {
      configs: {
        uploadUrl: null,
        uploadAccept: ".png,.gif,.jpg,.jpeg,.mp3,.m4a,.mp4",
        uploadMaxSize: 0,
        spectrogramUrl: null,
        audiowaveformUrl: null,
      },
      uploading: false,
      uploadProgress: null,
      generatingSpectrogram: false,
      generatingAudiowaveform: false,
    };
  },
  getters: {
    isDraggable() {
      return (item) => {
        return item.type !== "font";
      };
    },
    getUsage() {
      return (asset) => {
        const url = asset.url ?? asset.file?.url;
        const { getComponents } = useModule("app_components");
        return getComponents().filter((c) => {
          return c.src === url || c["background-image"] === url;
        });
      };
    },
    canUpload() {
      return this.configs.uploadUrl !== null;
    },
    canGenerateSpectrogram() {
      return this.configs.spectrogramUrl !== null;
    },
    canGenerateAudiowaveform() {
      return this.configs.audiowaveformUrl !== null;
    },
  },
  actions: {
    configure(configs) {
      this.configs = {
        ...this.configs,
        ...configs,
      };
    },
    async upload(files) {
      this.uploading = true;
      this.uploadProgress = 0;

      let items = [];

      try {
        items = await api.uploadFiles(this.configs.uploadUrl, files, (evt) => {
          this.uploadProgress = evt.loaded / evt.total;
        });
      } finally {
        this.uploading = false;
        this.uploadProgress = null;
      }

      items.map(useModule("assets_manager").addAsset);

      return items;
    },
    generateSpectrogram(data) {
      this.generatingSpectrogram = true;

      return api
        .generateAsset(this.configs.spectrogramUrl, data)
        .then((item) => {
          useModule("assets_manager").addAsset(item);
          return item;
        })
        .finally(() => {
          this.generatingSpectrogram = false;
        });
    },
    generateAudiowaveform(data) {
      this.generatingAudiowaveform = true;

      return api
        .generateAsset(this.configs.audiowaveformUrl, data)
        .then((item) => {
          useModule("assets_manager").addAsset(item);
          return item;
        })
        .finally(() => {
          this.generatingAudiowaveform = false;
        });
    },
  },
});
