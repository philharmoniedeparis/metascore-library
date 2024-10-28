import { readonly } from "vue";
import { defineStore } from "pinia";
import { useModule } from "@core/services/module-manager";
import { normalize } from "./utils/normalize";
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
      items: new Map(),
      deleted: new Map(),
      uploading: false,
      uploadProgress: null,
      generatingSpectrogram: false,
      generatingAudiowaveform: false,
    };
  },
  getters: {
    getName() {
      return (item) => {
        return item.name;
      };
    },
    getFile() {
      return (item) => {
        return item.shared ? item.file : item;
      };
    },
    getType() {
      return (item) => {
        if (item.type) return item.type;

        const file = item.shared ? item.file : item;
        const matches = /^(image|audio|video)\/.*/.exec(file.mimetype);
        return matches ? matches[1] : null;
      };
    },
    get() {
      return (id) => {
        return this.items.has(id) ? readonly(this.items.get(id)) : null;
      };
    },
    all() {
      return Array.from(this.items.values());
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
    init(data) {
      this.items = normalize(data);
      this.items.forEach((item) => {
        item.type = this.getType(item);
      });
    },
    add(item) {
      if (this.items.has(item.id)) return;

      item.type = this.getType(item);
      this.items.set(item.id, item);
    },
    delete(id) {
      if (!this.items.has(id)) return;

      this.deleted.set(id, this.items.get(id));
      this.items.delete(id);
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

      items.map(this.add);

      return items;
    },
    generateSpectrogram(data) {
      this.generatingSpectrogram = true;

      return api
        .generateAsset(this.configs.spectrogramUrl, data)
        .then((item) => {
          this.add(item);
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
          this.add(item);
          return item;
        })
        .finally(() => {
          this.generatingAudiowaveform = false;
        });
    },
  },
});
