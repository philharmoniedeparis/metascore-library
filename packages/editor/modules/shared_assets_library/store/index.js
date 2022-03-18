import { defineStore } from "pinia";
import Fuse from "fuse.js";
import { markRaw } from "vue";
import { load } from "@metascore-library/core/utils/ajax";
import { normalize } from "./utils/normalize";

const fuse = markRaw(
  new Fuse([], {
    tokenize: true,
    findAllMatches: true,
    threshold: 0.25,
    keys: ["name"],
  })
);

export default defineStore("shared-assets-library", {
  state: () => {
    return {
      list: [],
      items: {},
      loaded: false,
      filters: {
        terms: "",
        tags: [],
      },
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
    filtered() {
      let items = this.all;

      items = items.filter((item) => {
        const tags = this.filters.tags;
        const type = this.getType(item);
        if (tags.includes("animated") && type === "lottie_animation") {
          return true;
        }
        if (tags.includes("static") && type !== "lottie_animation") {
          return true;
        }
        return false;
      });

      if (this.filters.terms) {
        fuse.setCollection(items);
        items = fuse.search(this.filters.terms).map((r) => r.item);
      }

      return items;
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
});
