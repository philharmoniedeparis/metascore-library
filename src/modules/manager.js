import { isFunction } from "lodash";
import eventBus from "../utils/eventBus.js";

const registered = [];

export async function registerModules(modules, app, store, router = null) {
  for (const module of modules) {
    await registerModule(module, app, store, router);
  }
}

export async function registerModule(module, app, store, router = null) {
  if (registered.includes(module.name)) {
    // Skip if already registerd.
    return;
  }

  // Add to list of registered modules.
  registered.push(module.name);

  // Register dependencies.
  if ("dependencies" in module) {
    const dependencies = isFunction(module.dependencies)
      ? await module.dependencies()
      : module.dependencies;

    for (const dependency of dependencies) {
      await registerModule(dependency, app, store, router);
    }
  }

  // Install.
  module.install({ app, store, router, eventBus });
}
