import { defineStore } from "pinia";
import { union, difference } from "lodash";

export default defineStore("history", {
  state: () => {
    return {
      stack: [],
      index: 0,
      stores: {},
      processing: false,
    };
  },
  getters: {
    canUndo() {
      return this.index > 0;
    },
    canRedo() {
      return this.index < this.stack.length;
    },
  },
  actions: {
    onAction(action) {
      if (this.processing) {
        return;
      }

      const {
        name, // name of the action
        store, // store instance
        //args, // array of parameters passed to the action
        after, // hook after the action returns or resolves
        onError, // hook if the action throws or rejects
      } = action;
      const storeId = store.$id;

      if (!(storeId in this.stores)) {
        return;
      }

      const options = this.stores[storeId];
      if (!options.tracked.includes(name)) {
        return;
      }

      const oldState = options.store.$state;
      after((result) => {
        console.log(oldState, result);
      });
    },
    track(store, actions) {
      const storeId = store.$id;

      if (!(storeId in this.stores)) {
        this.stores[storeId] = {
          store,
          tracked: [],
        };
      }
      if (!("off" in this.stores[storeId])) {
        this.stores[storeId].off = store.$onAction(this.onAction);
      }
      this.stores[storeId].tracked = union(
        this.stores[storeId].tracked,
        actions
      );
    },
    untrack(store, actions = null) {
      const storeId = store.$id;

      if (!(storeId in this.stores)) {
        return;
      }

      if (actions === null) {
        this.stores[storeId].off();
        delete this.stores[storeId];
      } else {
        this.stores[storeId].tracked = difference(
          this.stores[storeId].tracked,
          actions
        );
      }
    },
    untrackAll() {
      Object.values(this.stores).forEach((s) => {
        if ("off" in s) {
          s.off();
        }
      });

      this.stores = {};
    },
    push(value) {
      this.stack.splice(this.index);
      this.stack.push(value);
      this.index++;
    },
    undo() {
      if (this.canUndo()) {
        const item = this.stack[--this.index];
        this.process(item, "undo");
      }
    },
    redo() {
      if (this.canRedo()) {
        const item = this.stack[this.index++];
        this.process(item, "redo");
      }
    },
    process(item, action = "undo") {
      const { storeId } = item;
      const store = this.stores.get(storeId);
      if (!store) {
        return;
      }

      this.processing = true;
      switch (action) {
        case "redo":
          break;

        case "undo":
          break;
      }
      this.processing = false;
    },
  },
});
