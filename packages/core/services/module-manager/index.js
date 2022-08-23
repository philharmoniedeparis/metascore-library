import { isFunction } from "lodash";

const modules = new Map();

async function registerModules(modules, context) {
  for (const module of modules) {
    await registerModule(module, context);
  }
}

async function registerModule(module, context) {
  if (modules.has(module.id)) {
    // Skip if already registerd.
    return;
  }

  // Add to list of registered modules.
  modules.set(module.id, null);

  // Register dependencies.
  const dependencies = isFunction(module.dependencies)
    ? await module.dependencies(context)
    : module.dependencies;
  for (const dependency of dependencies) {
    await registerModule(dependency, context);
  }

  // Install.
  const instance = new module(context);
  modules.set(module.id, instance);

  if (process.env.NODE_ENV === "development") {
    console.info(`Module manager: "${module.id}" module registerd.`);
  }
}

function useModule(id) {
  const module = modules.get(id);

  if (!module) {
    throw Error(`Module "${id}" not found`);
  }

  return module;
}

export { registerModules, registerModule, useModule };
