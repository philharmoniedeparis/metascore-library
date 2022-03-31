import { defineStore } from "pinia";

export default defineStore("revisions", {
  state: () => {
    return {
      list: [],
      latest: null,
      active: null,
    };
  },
  getters: {},
  actions: {},
});
