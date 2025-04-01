import { defineStore } from "pinia";

export interface Item {
  label: string
  handler: () => void
  items: Item[]
}

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
