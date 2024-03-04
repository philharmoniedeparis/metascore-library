const modules = new Map();

export class ModuleNotFoundError extends Error {
  constructor(id) {
    super(`Module "${id}" not found`);
    this.module = id;
  }
}

export function registerModules(modules, context) {
  modules.forEach((module) => {
    registerModule(module, context);
  });
}

export function registerModule(module, context) {
  if (modules.has(module.id)) {
    // Skip if already registerd.
    return;
  }

  // Add to list of registered modules.
  modules.set(module.id, null);

  // Register dependencies.
  module.dependencies.forEach((dependency) => {
    registerModule(dependency, context);
  });

  // Install.
  const instance = new module(context);
  modules.set(module.id, instance);

  if (process.env.NODE_ENV === "development") {
    console.info(`Module manager: "${module.id}" module registerd.`);
  }
}

export function useModule(id) {
  const module = modules.get(id);

  if (!module) {
    throw new ModuleNotFoundError(id);
  }

  return module;
}
