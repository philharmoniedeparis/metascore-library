import { watch } from "vue";
import { defineStore, storeToRefs } from "pinia";
import HistoryItem from "./HistoryItem";
import HistoryGroup from "./HistoryGroup";

const COALESCE_THRESHOLD = 750;

export default defineStore("history", {
  state: () => {
    return {
      active: false,
      stack: [],
      groups: [],
      index: 0,
      processing: false,
      lastPushTime: null,
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
        // This push is part of an open group.
        // Push it to the group, which will then be pushed here once closed.
        this.groups.at(-1).push(item);
        return;
      }

      const now = Date.now();
      const previousPushTime = this.lastPushTime;
      const previous = this.stack.at(-1);
      const coalesce =
        previous &&
        item.coalesceId &&
        item.coalesceId === previous.coalesceId &&
        previousPushTime &&
        previousPushTime + COALESCE_THRESHOLD > now;

      this.lastPushTime = now;

      if (coalesce) {
        // Coalesce with previous.
        previous.redo = item.redo;
      } else {
        // Add to stack.
        if (previous) previous.coalesceId = null;
        this.stack.push(item);
        this.index++;
      }
    },
    startGroup({ coalesce = false, coalesceId } = {}) {
      if (!this.active || this.processing) {
        return;
      }

      const group = new HistoryGroup({ coalesce, coalesceId });
      this.groups.push(group);
    },
    endGroup(discard = false) {
      if (!this.active || this.processing) {
        return;
      }

      if (this.groups.length > 0) {
        const group = this.groups.pop();
        if (!discard) {
          this.push(group);
        }
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
        watch(
          storeToRefs(this).processing,
          () => {
            this.clear();
          },
          { once: true }
        );
        return;
      }

      this.stack = [];
      this.groups = [];
      this.index = 0;
    },
  },
});
