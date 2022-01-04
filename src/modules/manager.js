import eventBus from "../utils/eventBus.js";

export function registerModule(module, app, store, router) {
  module({ app, store, router, eventBus });
}
