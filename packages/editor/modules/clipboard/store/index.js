export default {
  state: () => {
    return {
      data: null,
      format: null,
    };
  },
  actions: {
    setData(format, data) {
      this.data = data;
      this.format = format;
    },
    clear() {
      this.data = null;
      this.format = null;
    },
  },
};
