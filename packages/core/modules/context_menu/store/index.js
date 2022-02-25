export default {
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
    reset() {
      this.items = [];
    },
  },
};
