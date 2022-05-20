import { defineStore } from "pinia";

export default defineStore("hotkey", {
  state: () => {
    return {
      hotkeys: new Map(),
    };
  },
  getters: {},
  actions: {
    addGroup(group) {
      if (!this.hotkeys.has(group)) {
        this.hotkeys.set(group, new Map());
      }
    },
    removeGroup(group) {
      this.hotkeys.delete(group);
    },
    addCombination(group, combination, description) {
      this.addGroup(group);
      this.hotkeys.get(group).set(combination, description);

      console.log(this.hotkeys);
    },
    removeCombination(group, combination) {
      if (this.hotkeys.has(group)) {
        this.hotkeys.get(group).delete(combination);
        if (this.hotkeys.get(group).length === 0) {
          this.removeGroup(group);
        }
      }
    },
  },
});
