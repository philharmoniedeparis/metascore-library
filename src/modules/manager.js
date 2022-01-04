import eventBus from "../utils/eventBus.js";

const registered = [];

export function register(module, app, store, router) {
  if (registered.includes(module.name)) {
    // Skip if already registerd.
    return;
  }

  // Add to list of registered modules.
  registered.push(module.name);

  // Register dependencies.
  if (module.dependencies) {
    module.dependencies.forEach((dependency) => {
      register(dependency, app, store, router);
    });
  }

  // Install.
  module.install({ app, store, router, eventBus });
}
