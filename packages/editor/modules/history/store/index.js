import { defineStore } from "pinia";
import HistoryItem from "./HistoryItem";
import HistoryGroup from "./HistoryGroup";

export default defineStore("history", {
  state: () => {
    return {
      active: false,
      stack: [],
      groups: [],
      index: 0,
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
    push({ redo, undo }) {
      if (!this.active || this.processing) {
        return;
      }

      const item = new HistoryItem({ redo, undo });

      if (this.groups.length > 0) {
        this.groups.at(-1).push(item);
      } else {
        this.stack.splice(this.index);
        this.stack.push(item);
        this.index++;
      }
    },
    startGroup(coalesce = false) {
      if (!this.active || this.processing) {
        return;
      }

      const group = new HistoryGroup(coalesce);
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
  },
});
