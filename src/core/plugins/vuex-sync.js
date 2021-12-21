export function createVuexSync({
  channelName = "vuex-sync",
  filterOutgoing = null,
  processIncoming = null,
} = {}) {
  return (store) => {
    if (!window.BroadcastChannel) {
      throw new Error("BroadcastChannel not available");
    }

    const channel = new BroadcastChannel(channelName);
    let sharingInProgress = false;

    // Subscribe to store mutations
    store.subscribe((mutation, state) => {
      if (sharingInProgress) {
        return Promise.resolve(false);
      }

      if (filterOutgoing && filterOutgoing(mutation, state) === false) {
        return;
      }

      channel.postMessage(mutation);
    });

    // Listen for incoming messages.
    channel.addEventListener("message", (evt) => {
      try {
        sharingInProgress = true;

        let mutation = evt.data;

        if (processIncoming && processIncoming(mutation) === false) {
          return;
        }

        store.commit(mutation.type, mutation.payload);
      } finally {
        sharingInProgress = false;
      }
    });
  };
}
