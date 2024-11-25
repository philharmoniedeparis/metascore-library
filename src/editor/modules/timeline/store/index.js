import { defineStore } from "pinia";

export default defineStore("timeline", {
  state: () => {
    return {
      activeSnapTargets: [],
    };
  },
});
