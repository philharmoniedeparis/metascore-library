import { defineStore } from "pinia";

export default defineStore("history", {
  state: () => {
    return {
      active: false,
      stack: [],
      group: null,
      index: 0,
      stores: {},
      processing: false,
    };
  },
  getters: {
    canUndo(state) {
      return state.index > 0;
    },
    canRedo(state) {
      return state.index < state.stack.length;
    },
  },
  actions: {
    push(item) {
      if (!this.active || this.processing) {
        return;
      }

      if (this.group !== null) {
        this.group.push(item);
      } else {
        this.stack.splice(this.index);
        this.stack.push(item);
        this.index++;
      }
    },
    startGroup() {
      if (!this.active || this.processing) {
        return;
      }

      this.group = [];
    },
    endGroup() {
      if (!this.active || this.processing) {
        return;
      }

      const group = this.group;
      this.group = null;
      if (group && group.length > 0) {
        this.push({
          undo: group[0].undo,
          redo: group[group.length - 1].redo,
        });
      }
    },
    async undo() {
      if (this.canUndo) {
        this.processing = true;

        const item = this.stack[--this.index];
        await item.undo();

        this.processing = false;
      }
    },
    async redo() {
      if (this.canRedo) {
        this.processing = true;

        const item = this.stack[this.index++];
        await item.redo();

        this.processing = false;
      }
    },
  },
});
