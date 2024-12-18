import { readonly } from "vue";
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
      configs: {
        url: null,
      },
      items: new Map(),
      loaded: false,
      loading: false,
      filters: {
        terms: "",
        tags: [],
      },
    };
  },
  getters: {
    get() {
      return (id) => {
        return this.items.has(id) ? readonly(this.items.get(id)) : null;
      };
    },
    all() {
      return Array.from(this.items.values());
    },
    filtered() {
      let items = this.all;

      items = items.filter((item) => {
        const tags = this.filters.tags;
        const type = item.type;
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
    configure(configs) {
      this.configs = {
        ...this.configs,
        ...configs,
      };
    },
    async load() {
      if (this.loaded || this.loading) {
        return;
      }

      this.loading = true;

      const data = await api.load(this.configs.url);
      this.items = normalize(data.assets);
      this.items.forEach((item) => {
        item.type = this.getType(item);
      });

      this.loaded = true;
      this.loading = false;
    },
  },
});
