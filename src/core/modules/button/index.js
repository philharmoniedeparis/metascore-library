import AbstractModule from '@core/services/module-manager/AbstractModule'

import BaseButton from './components/BaseButton.vue'
import SplitButton from './components/SplitButton.vue'

export default class BaseButtonModule extends AbstractModule {
  static id = 'base_button'

  constructor({ app }) {
    super(arguments)

    app.component('BaseButton', BaseButton)
    app.component('SplitButton', SplitButton)
  }
}
