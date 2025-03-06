import AbstractModule from '@core/services/module-manager/AbstractModule'

import CollapsiblePanel from './components/CollapsiblePane.vue'

export default class CollapsiblePanelModule extends AbstractModule {
  static id = 'editor:collapsible_panel'

  constructor({ app }) {
    super(arguments)

    app.component('CollapsiblePanel', CollapsiblePanel)
  }
}
