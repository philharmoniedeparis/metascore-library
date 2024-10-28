import { readonly } from "vue";
import { defineStore } from "pinia";
import { normalize } from "./utils/normalize";

export default defineStore("assets-manager", {
  state: () => {
    return {
      items: new Map(),
      deleted: new Map(),
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
        const matches = /^(image|audio|video|font)\/.*/.exec(file.mimetype);
        if (matches) return matches[1];

        return null;
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
  },
  actions: {
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
  },
});
