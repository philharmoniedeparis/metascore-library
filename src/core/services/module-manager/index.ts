import type AbstractModule from './AbstractModule'
import { type Context } from './AbstractModule'

const modules = new Map<string, AbstractModule|null>()

export class ModuleNotFoundError extends Error {
  constructor(id: string) {
    super(`Module "${id}" not found`)
  }
}

export function registerModules(modules: (typeof AbstractModule)[], context: Context) {
  modules.forEach((module) => {
    registerModule(module, context)
  })
}

export function registerModule(Module: typeof AbstractModule, context: Context) {
  if (modules.has(Module.id)) {
    // Skip if already registerd.
    return
  }

  // Add to list of registered modules.
  modules.set(Module.id, null)

  // Register dependencies.
  Module.dependencies.forEach((dependency) => {
    registerModule(dependency, context)
  })

  // Install.
  const module = new Module(context)
  modules.set(Module.id, module)

  if (import.meta.env.DEV) {
    console.info(`Module manager: "${Module.id}" module registerd.`)
  }
}

export function useModule(id: string) {
  const module = modules.get(id)

  if (!module) {
    throw new ModuleNotFoundError(id)
  }

  return module
}
