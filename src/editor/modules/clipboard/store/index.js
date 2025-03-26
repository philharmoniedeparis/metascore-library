import { defineStore } from "pinia";

export default defineStore("clipboard", {
  state: () => {
    return {
      format: null,
      data: null,
    };
  },
  actions: {
    setData(format, data) {
      this.format = format;
      this.data = data;
    },
    clear() {
      this.format = null;
      this.data = null;
    },
  },
});
