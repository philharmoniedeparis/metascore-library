import AbstractModule, { type Context } from '@core/services/module-manager/AbstractModule'
import BaseButton from '../button'
import BaseModal from './components/BaseModal.vue'

export default class ModalModule extends AbstractModule {
  static id = 'core:modal'

  static dependencies = [BaseButton]

  constructor(context: Context) {
    super(context)

    const { app } = context
    app.component('BaseModal', BaseModal)
  }
}
