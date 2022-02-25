export default {
  state: () => {
    return {
      isOpen: false,
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
    open() {
      this.isOpen = true;
    },
    close() {
      this.isOpen = false;
      this.items = [];
    },
  },
};
