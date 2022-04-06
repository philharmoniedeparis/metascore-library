import { defineStore } from "pinia";

export default defineStore("app-renderer", {
  state: () => {
    return {
      width: null,
      height: null,
      css: null,
    };
  },
});
