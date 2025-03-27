import { type App } from 'vue'
import { type Pinia } from 'pinia'
import { type I18n } from 'vue-i18n'

export type Context = {
  app: App
  pinia: Pinia
  i18n: I18n
}

export default class AbstractModule {
  static id: string;

  static dependencies: (typeof AbstractModule)[] = [];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(context: Context) {}
}
