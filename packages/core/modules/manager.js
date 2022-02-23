import { isFunction } from "lodash";
const registered = [];

export async function registerModules(modules, app, store) {
  for (const module of modules) {
    await registerModule(module, app, store);
  }
}

export async function registerModule(module, app, store) {
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
      await registerModule(dependency, app, store);
    }
  }

  // Install.
  await module.install({ app, store });
}
