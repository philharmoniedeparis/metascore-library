import { isFunction } from "lodash";

const modules = {};

async function registerModules(modules, context) {
  for (const module of modules) {
    await registerModule(module, context);
  }
}

async function registerModule(module, context) {
  if (module.name in modules) {
    // Skip if already registerd.
    return;
  }

  // Add to list of registered modules.
  modules[module.name] = {};

  // Register dependencies.
  if ("dependencies" in module) {
    const dependencies = isFunction(module.dependencies)
      ? await module.dependencies()
      : module.dependencies;

    for (const dependency of dependencies) {
      await registerModule(dependency, context);
    }
  }

  // Install.
  if ("install" in module) {
    const exports = await module.install(context);
    if (typeof exports !== "undefined") {
      modules[module.name] = exports;
    }
  }

  if (process.env.NODE_ENV === "development") {
    console.info(`Module manager: "${module.name}" module registerd.`);
  }
}

function useModule(name) {
  const module = modules[name];

  if (!module) {
    throw Error(`Module "${name}" not found`);
  }

  return module;
}

export { registerModules, registerModule, useModule };
