import AbstractModule, { type Context } from '@core/services/module-manager/AbstractModule'

import BaseButton from './components/BaseButton.vue'
import SplitButton from './components/SplitButton.vue'

export default class BaseButtonModule extends AbstractModule {
  static id = 'base_button'

  constructor(context: Context) {
    super(context)

    const { app } = context
    app.component('BaseButton', BaseButton)
    app.component('SplitButton', SplitButton)
  }
}
