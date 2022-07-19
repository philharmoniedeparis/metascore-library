import { defineStore } from "pinia";

export default defineStore("app-behaviors", {
  state: () => {
    return {
      behaviors: null,
    };
  },
  actions: {
    init({ behaviors }) {
      this.behaviors = behaviors;
    },
    setBehaviors(value) {
      this.behaviors = value;
    },
  },
});
