import { readonly, type DeepReadonly } from "vue";
import { defineStore } from "pinia";
import { normalize } from "./utils/normalize";

export interface Item {
  id: number
  type?: string
  name: string
  size: number
  mimetype: string
  url: string
  width?: number
  height?: number
}

export interface SharedItem {
  id: number
  name: string
  type: string
  file: Item
  shared: true
}

export default defineStore("assets-manager", {
  state: () => {
    return {
      items: new Map<number, Item|SharedItem>(),
      deleted: new Map<number, Item|SharedItem>(),
    };
  },
  getters: {
    isShared() {
      return (item: Item|SharedItem): boolean => {
        return 'shared' in item && item.shared
      };
    },
    getName() {
      return (item: Item|SharedItem): string => {
        return item.name;
      };
    },
    getFontName() {
      return (item: Item|SharedItem): string => {
        return this.getName(item).split(".").slice(0, -1).join(".").trim();
      };
    },
    getFile() {
      return (item: Item|SharedItem): Item => {
        return this.isShared(item) ? (item as SharedItem).file : item as Item;
      };
    },
    getType() {
      return (item: Item|SharedItem): string|undefined => {
        if ('type' in item) return item.type;

        const file = this.getFile(item);
        const matches = /^(image|audio|video|font)\/.*/.exec(file.mimetype);
        if (matches) return matches[1];
      };
    },
    get(state) {
      return (id: number): DeepReadonly<Item|SharedItem>|null => {
        return this.items.has(id) ? readonly(state.items.get(id)!) : null;
      };
    },
    all(state): Array<Item|SharedItem> {
      return Array.from(state.items.values());
    },
  },
  actions: {
    init(data: Array<Item|SharedItem>) {
      this.items = normalize(data);
      this.items.forEach((item) => {
        item.type = this.getType(item);
      });
    },
    add(item: Item|SharedItem) {
      if (this.items.has(item.id)) return;

      item.type = this.getType(item);
      this.items.set(item.id, item);
    },
    delete(id: number) {
      if (!this.items.has(id)) return;

      this.deleted.set(id, this.items.get(id)!);
      this.items.delete(id);
    },
  },
});