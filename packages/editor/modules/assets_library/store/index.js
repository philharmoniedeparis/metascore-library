import { readonly } from "vue";
import { defineStore } from "pinia";
import { useModule } from "@metascore-library/core/services/module-manager";
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
      deleted: {},
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
        const item = this.items[id];
        return item ? readonly(item) : null;
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
    getUsage() {
      return (asset) => {
        const { url } = asset;
        const { getComponents } = useModule("app_components");
        const usage = [];

        getComponents().forEach((c) => {
          if (
            ("background-image" in c && c["background-image"] === url) ||
            ("src" in c && c.src === url)
          ) {
            usage.push(c);
          }
        });

        return usage;
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
      if (!this.items[id]) return;

      this.deleted[id] = this.items[id];
      delete this.items[id];
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
