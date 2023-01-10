import { watch } from "vue";
import { defineStore } from "pinia";
import HistoryItem from "./HistoryItem";
import HistoryGroup from "./HistoryGroup";

const COALESCE_THRESHOLD = 2000;

export default defineStore("history", {
  state: () => {
    return {
      active: false,
      stack: [],
      groups: [],
      index: 0,
      processing: false,
      previousCoalesceTime: null,
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

      this.stack.splice(this.index);

      if (!(item instanceof HistoryItem)) {
        item = new HistoryItem(item);
      }

      if (this.groups.length > 0) {
        // Add to open group.
        this.groups.at(-1).push(item);
        return;
      }

      const previous = this.stack.at(-1);
      if (
        previous &&
        item.coalesceId &&
        item.coalesceId === previous.coalesceId
      ) {
        const now = Date.now();
        const previousCoalesceTime = this.previousCoalesceTime || now;
        this.previousCoalesceTime = now;
        if (previousCoalesceTime + COALESCE_THRESHOLD > now) {
          // Coalesce with previous.
          previous.redo = item.redo;
          return;
        }
      }

      // Add to stack.
      this.previousCoalesceTime = null;
      if (previous) previous.coalesceId = null;
      this.stack.push(item);
      this.index++;
    },
    startGroup({ coalesce = false, coalesceId } = {}) {
      if (!this.active || this.processing) {
        return;
      }

      const group = new HistoryGroup({ coalesce, coalesceId });
      this.groups.push(group);
    },
    endGroup() {
      if (!this.active || this.processing) {
        return;
      }

      if (this.groups.length > 0) {
        const group = this.groups.pop();
        this.push(group);
      }
    },
    async undo() {
      if (!this.canUndo) return;

      this.processing = true;

      const item = this.stack[--this.index];
      await item.undo();

      this.processing = false;
    },
    async redo() {
      if (!this.canRedo) return;

      this.processing = true;

      const item = this.stack[this.index++];
      await item.redo();

      this.processing = false;
    },
    clear() {
      if (this.processing) {
        // Wait until the current process is done.
        const unwatch = watch(this.processing, () => {
          unwatch();
          this.clear();
        });
        return;
      }

      this.stack = [];
      this.groups = [];
      this.index = 0;
    },
  },
});
