import AbstractModule, { type Context } from '@core/services/module-manager/AbstractModule'
import Modal from '../modal'
import BaseButton from '../button'

import ConfirmDialog from './components/ConfirmDialog.vue'

export default class ConfirmModule extends AbstractModule {
  static id = 'confirm'

  static dependencies = [Modal, BaseButton]

  constructor(context: Context) {
    super(context)

    const { app } = context
    app.component('ConfirmDialog', ConfirmDialog)
  }
}
