import { defineStore } from "pinia";

export default defineStore("behaviors-form", {
  state: () => {
    return {
      viewport: null,
    };
  },
});
