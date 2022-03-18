import { defineStore } from "pinia";

export default defineStore("app-renderer", {
  state: () => {
    return {
      ready: false,
      width: null,
      height: null,
      css: null,
    };
  },
});
