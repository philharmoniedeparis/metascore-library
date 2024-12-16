import { defineStore } from "pinia";

export default defineStore("contextmenu", {
  state: () => {
    return {
      items: [],
    };
  },
  actions: {
    addItem(item) {
      this.items.push(item);
    },
    addItems(items) {
      this.items.push(...items);
    },
    clear() {
      this.items = [];
    },
  },
});
