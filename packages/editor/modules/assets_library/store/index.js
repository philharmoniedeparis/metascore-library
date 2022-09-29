import { readonly } from "vue";
import { defineStore } from "pinia";
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
      items: {},
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
        if (item.type) {
          return item.type;
        }

        const file = item.shared ? item.file : item;
        const matches = /^(image|audio|video)\/.*/.exec(file.mimetype);
        return matches ? matches[1] : null;
      };
    },
    get() {
      return (id) => {
        const item = this.items[id];
        return item && !item.$deleted ? readonly(item) : null;
      };
    },
    all() {
      return Object.keys(this.items)
        .map(this.get)
        .filter((a) => a);
    },
    getByType() {
      return (type) => {
        return this.all.filter((a) => {
          return this.getType(a) === type;
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
    },
    add(item) {
      if (item.id in this.items) {
        return;
      }

      this.items[item.id] = item;
    },
    delete(id) {
      const item = this.items[id];
      if (item) {
        item.$deleted = true;
      }
    },
    upload(files) {
      this.uploading = true;
      this.uploadProgress = 0;

      return api
        .uploadFiles(this.configs.uploadUrl, files, (evt) => {
          this.uploadProgress = evt.loaded / evt.total;
        })
        .then((items) => {
          items.map(this.add);
          return items;
        })
        .finally(() => {
          this.uploading = false;
          this.uploadProgress = null;
        });
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
