import { isFunction } from "lodash";
import { defineStore } from "pinia";

const modules = [];
const stores = {};

function registerStore(id, definition) {
  stores[id] = defineStore(id, definition);
}

async function registerModules(modules, app) {
  for (const module of modules) {
    await registerModule(module, app);
  }
}

async function registerModule(module, app) {
  if (modules.includes(module.name)) {
    // Skip if already registerd.
    return;
  }

  // Add to list of registered modules.
  modules.push(module.name);

  // Register dependencies.
  if ("dependencies" in module) {
    const dependencies = isFunction(module.dependencies)
      ? await module.dependencies()
      : module.dependencies;

    for (const dependency of dependencies) {
      await registerModule(dependency, app);
    }
  }

  // Register stores.
  if ("stores" in module) {
    Object.entries(module.stores).forEach(([id, definition]) => {
      registerStore(id, definition);
    });
  }

  // Install.
  await module.install({ app });
}

function useStore(id) {
  const store = stores[id];

  if (!store) {
    throw Error(`Store "${id}" not found`);
  }

  return store();
}

export { registerModules, registerModule, registerStore, useStore };
