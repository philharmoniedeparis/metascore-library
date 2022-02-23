import { load } from "@metascore-library/core/utils/ajax";
import { normalize } from "./utils/normalize";

export default {
  state: () => {
    return {
      list: [],
      items: {},
      loaded: false,
    };
  },
  getters: {
    get() {
      return (id) => {
        return this.items[id];
      };
    },
    all() {
      return this.list.map(this.get);
    },
    getName() {
      return (item) => {
        return item.name;
      };
    },
    getFile() {
      return (item) => {
        return item.file;
      };
    },
    getType() {
      return (item) => {
        return item.type;
      };
    },
  },
  actions: {
    async load(url) {
      if (this.loaded) {
        return;
      }

      const data = await load(url);
      const normalized = normalize(data.assets);

      this.items = normalized.entities.items;
      this.list = normalized.result;

      this.loaded = true;
    },
  },
};
