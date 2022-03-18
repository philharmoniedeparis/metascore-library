import { defineStore } from "pinia";
import { normalize } from "./utils/normalize";

export default defineStore("assets-library", {
  state: () => {
    return {
      list: [],
      items: {},
    };
  },
  getters: {
    get() {
      return (id) => {
        const item = this.items[id];
        return item && !item.$deleted ? item : null;
      };
    },
    all() {
      return this.list
        .map((id) => {
          return this.get(id);
        })
        .filter((i) => i);
    },
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
  },
  actions: {
    init(data) {
      const normalized = normalize(data);
      this.items = normalized.entities.items;
      this.list = normalized.result;
    },
    add(item) {
      if (this.list.includes(item.id)) {
        return;
      }

      this.items[item.id] = item;
      this.list.push(item.id);
    },
    delete(id) {
      const item = this.items[id];
      if (item) {
        item.$deleted = true;
      }
    },
    createSpectrogram(data) {},
    createWaveform(data) {},
  },
});
