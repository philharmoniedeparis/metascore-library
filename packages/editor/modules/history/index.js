import * as stack from "./utils/undo-stack";

export default {
  id: "history",
  install({ pinia }) {
    const stores = new Map();
    let mutations = {};
    let actions = {};
    let processing = false;

    pinia.use(({ store }) => {
      stores.set(store.$id, store);
    });

    function handleMutation(mutation) {
      if (processing) {
        return;
      }

      const { storeId, events } = mutation || {};

      if (mutations[storeId]?.includes(events.key)) {
        const { key, oldValue, newValue } = events;

        stack.push({
          type: "mutation",
          storeId,
          key,
          oldValue,
          newValue,
        });
      }
    }

    function undoMutation({ storeId, key, oldValue }) {
      const store = stores.get(storeId);
      if (store) {
        store.$patch({
          [key]: oldValue,
        });
      }
    }

    function redoMutation({ storeId, key, newValue }) {
      const store = stores.get(storeId);
      if (store) {
        store.$patch({
          [key]: newValue,
        });
      }
    }

    function subscribeMutation(store, mutation) {
      console.log("subscribeMutation", store, mutation);
      if (!(store.id in mutations)) {
        mutations[store.id] = [];
        store.$subscribe(handleMutation);
      }
      if (!mutations[store.id].includes(mutation)) {
        mutations[store.id].push(mutation);
      }
    }

    function unsubscribeMutation(store, mutation = null) {
      console.log("unsubscribeMutation", store, mutation);
      if (!(store.id in mutations)) {
        return;
      }

      if (mutation === null) {
        delete mutations[store.id];
        return;
      } else if (!mutations[store.id].includes(mutation)) {
        return;
      }

      mutations[store.id].filter((m) => m !== mutation);
    }

    function handleAction(context) {
      const {
        name, // name of the action
        store, // store instance
        args, // array of parameters passed to the action
        after, // hook after the action returns or resolves
        onError, // hook if the action throws or rejects
      } = context;

      if (processing) {
        return;
      }

      if (actions[store.id]?.includes(name)) {
        after((result) => {
          console.log(store.id, name, result);
        });
      }
    }

    function undoAction() {

    }

    function redoAction() {

    }

    function subscribeAction(store, action) {
      console.log("subscribeAction", store, action);
      if (!(store.id in actions)) {
        actions[store.id] = [];
        store.$onAction(handleAction);
      }
      if (!actions[store.id].includes(action)) {
        actions[store.id].push(action);
      }
    }

    function unsubscribeAction(store, action = null) {
      console.log("unsubscribeAction", store, action);
      if (!(store.id in actions)) {
        return;
      }

      if (action === null) {
        delete actions[store.id];
        return;
      } else if (!actions[store.id].includes(action)) {
        return;
      }

      actions[store.id].filter((a) => a !== action);
    }

    function unsubscribeAll() {
      mutations = {};
      actions = {};
    }

    function canUndo() {
      return stack.canUndo();
    }

    function canRedo() {
      return stack.canRedo();
    }

    function undo() {
      if (!canUndo()) {
        return;
      }

      processing = true;

      const item = stack.undo();
      switch (item.type) {
        case "mutataion":
          undoMutation(item);
          break;

        case "action":
          undoAction(item);
          break;
      }

      processing = false;
    }

    function redo() {
      if (!canRedo()) {
        return;
      }

      processing = true;

      const item = stack.redo();
      switch (item.type) {
        case "mutataion":
          redoMutation(item);
          break;

        case "action":
          redoAction(item);
          break;
      }

      processing = false;
    }

    return {
      subscribeMutation,
      unsubscribeMutation,
      subscribeAction,
      unsubscribeAction,
      unsubscribeAll,
      canUndo,
      canRedo,
      undo,
      redo,
    };
  },
};
