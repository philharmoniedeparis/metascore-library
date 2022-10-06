import { defineStore } from "pinia";

export default defineStore("history", {
  state: () => {
    return {
      active: false,
      stack: [],
      groups: [],
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

      if (this.groups.length > 0) {
        this.groups[this.groups.length - 1].items.push(item);
      } else {
        this.stack.splice(this.index);
        this.stack.push(item);
        this.index++;
      }
    },
    startGroup(mergeable = false) {
      if (!this.active || this.processing) {
        return;
      }

      this.groups.push({
        items: [],
        mergeable,
      });
    },
    endGroup() {
      if (!this.active || this.processing) {
        return;
      }

      const group = this.groups.pop();
      if (group) {
        const { mergeable, items } = group;

        if (items.length === 0) return;

        if (mergeable) {
          this.push({
            undo: items[0].undo,
            redo: items[items.length - 1].redo,
          });
        } else {
          this.push({
            undo: async () => {
              for (const item of [...items].reverse()) {
                await item.undo();
              }
            },
            redo: async () => {
              for (const item of items) {
                await item.redo();
              }
            },
          });
        }
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
