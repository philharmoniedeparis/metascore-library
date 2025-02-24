import AbstractModule, { type Context } from '@core/services/module-manager/AbstractModule'
import useStore from './store'
import BaseButton from '../button'
import directive from './directives/contexmenu'
import ContextMenu from './components/ContextMenu.vue'

export default class ContextMenuModule extends AbstractModule {
  static id = 'contextmenu'

  static dependencies = [BaseButton]

  constructor(context: Context) {
    super(context)

    const { app } = context
    app.directive('contextmenu', directive)
    app.component('ContextMenu', ContextMenu)
  }

  addItem(item) {
    const store = useStore()
    store.addItem(item)
  }

  addItems(items) {
    const store = useStore()
    store.addItems(items)
  }
}
