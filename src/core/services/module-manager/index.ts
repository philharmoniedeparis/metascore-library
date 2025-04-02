import { type Context } from './AbstractModule'

// The modules map is augmented by the generate-types vite plugin.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ModulesMap {};
export type ModuleId = keyof ModulesMap;

const modules = new Map<ModuleId, InstanceType<ModulesMap[ModuleId]>|null>()

export class ModuleNotFoundError extends Error {
  constructor(id: string) {
    super(`Module "${id}" not found`)
  }
}

export function registerModules(Modules: ModulesMap[ModuleId][], context: Context) {
  Modules.forEach((Module) => {
    registerModule(Module, context)
  })
}

export function registerModule(Module: ModulesMap[ModuleId], context: Context) {
  const id = Module.id as ModuleId

  if (modules.has(id)) {
    // Skip if already registerd.
    return
  }

  // Add to list of registered modules.
  modules.set(id, null)

  // Register dependencies.
  Module.dependencies.forEach((dependency) => {
    registerModule(dependency, context)
  })

  // Install.
  const module = new Module(context)
  modules.set(id, module)

  if (import.meta.env.DEV) {
    console.info(`Module manager: "${Module.id}" module registerd.`)
  }
}

export function useModule<K extends ModuleId>(id: K) {
  const module = modules.get(id)

  if (!module) {
    throw new ModuleNotFoundError(id)
  }

  return module as InstanceType<ModulesMap[K]>
}
