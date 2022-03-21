import * as stack from "../utils/undo-stack";

const stores = new Map();
let mutations = {};
let actions = {};
let processing = false;

/**
 *
 */
function addStore(store) {
  stores.set(store.$id, store);
}

/**
 *
 */
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

/**
 *
 */
function subscribeMutation(store, mutation) {
  if (!(store.$id in mutations)) {
    mutations[store.$id] = [];
    store.$subscribe(handleMutation);
  }
  if (!mutations[store.$id].includes(mutation)) {
    mutations[store.$id].push(mutation);
  }
}

/**
 *
 */
function unsubscribeMutation(store, mutation = null) {
  if (!(store.$id in mutations)) {
    return;
  }

  if (mutation === null) {
    delete mutations[store.$id];
    return;
  } else if (!mutations[store.$id].includes(mutation)) {
    return;
  }

  mutations[store.$id].filter((m) => m !== mutation);
}

/**
 *
 */
function handleAction(context) {
  const {
    name, // name of the action
    store, // store instance
    //args, // array of parameters passed to the action
    after, // hook after the action returns or resolves
    onError, // hook if the action throws or rejects
  } = context;

  if (processing) {
    return;
  }

  if (actions[store.$id]?.includes(name)) {
    after((result) => {
      console.log("after", store.$id, name, result);
    });
    onError((...args) => {
      console.log("onError", ...args);
    });
  }
}

/**
 *
 */
function subscribeAction(store, action) {
  if (!(store.$id in actions)) {
    actions[store.$id] = [];
    store.$onAction(handleAction);
  }
  if (!actions[store.$id].includes(action)) {
    actions[store.$id].push(action);
  }
}

/**
 *
 */
function unsubscribeAction(store, action = null) {
  if (!(store.$id in actions)) {
    return;
  }

  if (action === null) {
    delete actions[store.$id];
    return;
  } else if (!actions[store.$id].includes(action)) {
    return;
  }

  actions[store.$id].filter((a) => a !== action);
}

/**
 *
 */
function unsubscribeAll() {
  mutations = {};
  actions = {};
}

/**
 *
 */
function canUndo() {
  return stack.canUndo();
}

/**
 *
 */
function canRedo() {
  return stack.canRedo();
}

/**
 *
 */
function process(action = "undo") {
  const item = stack[action]();
  if (!item) {
    return;
  }

  const { storeId } = item;
  const store = stores.get(storeId);
  if (!store) {
    return;
  }

  processing = true;
  switch (item.type) {
    case "mutation":
      {
        const { key, oldValue, newValue } = item;
        if (store) {
          store.$patch({
            [key]: action === "redo" ? newValue : oldValue,
          });
        }
      }
      break;

    case "action":
      break;
  }
  processing = false;
}

/**
 *
 */
function undo() {
  process("undo");
}

/**
 *
 */
function redo() {
  process("redo");
}

export {
  addStore,
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
