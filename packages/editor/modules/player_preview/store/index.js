import { defineStore } from "pinia";

export default defineStore("player-preview", {
  state: () => {
    return {
      zoom: 1,
      preview: false,
    };
  },
});
