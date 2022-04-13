import { defineStore } from "pinia";
import Fuse from "fuse.js";
import { markRaw } from "vue";
import { normalize } from "./utils/normalize";
import * as api from "../api";

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
      return Object.values(this.items);
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

      const data = await api.loadItems(url);
      this.items = normalize(data.assets);

      this.loaded = true;
    },
  },
});
