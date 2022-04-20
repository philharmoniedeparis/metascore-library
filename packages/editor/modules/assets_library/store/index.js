import { defineStore } from "pinia";
import { normalize } from "./utils/normalize";
import * as api from "../api";

export default defineStore("assets-library", {
  state: () => {
    return {
      items: {},
      processing: false,
      uploadProgress: null,
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
        return item && !item.$deleted ? item : null;
      };
    },
    all() {
      return Object.keys(this.items)
        .map(this.get)
        .filter((a) => a);
    },
    filterByType() {
      return (type) => {
        return this.all.filter((a) => {
          return this.getType(a) === type;
        });
      };
    },
  },
  actions: {
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
    upload(url, files) {
      this.processing = true;
      this.uploadProgress = 0;

      return api
        .uploadFiles(url, files, (evt) => {
          this.uploadProgress = evt.loaded / evt.total;
        })
        .then((items) => {
          items.map(this.add);
          return items;
        })
        .finally(() => {
          this.processing = false;
          this.uploadProgress = null;
        });
    },
    generate(url, data) {
      this.processing = true;

      return api
        .generateAsset(url, data)
        .then((item) => {
          this.add(item);
          return item;
        })
        .finally(() => {
          this.processing = false;
        });
    },
  },
});
