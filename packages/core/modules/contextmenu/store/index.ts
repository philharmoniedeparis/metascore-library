import { defineStore } from "pinia";
import type { Item } from "../components/ContextMenuItem.vue";

export default defineStore("contextmenu", {
  state: () => {
    return {
      items: [] as Item[],
    };
  },
  actions: {
    addItem(item: Item) {
      this.items.push(item);
    },
    addItems(items: Item[]) {
      this.items.push(...items);
    },
    clear() {
      this.items = [];
    },
  },
});
