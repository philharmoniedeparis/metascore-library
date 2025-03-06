import AbstractModule from '@core/services/module-manager/AbstractModule'
import AppComponents from '@core/modules/app_components'
import Confirm from '@core/modules/confirm'
import ContextMenu from '@core/modules/contextmenu'
import BaseButton from '@core/modules/button'

import ScenarioManager from './components/ScenarioManager.vue'

export default class ScenarioManagerModule extends AbstractModule {
  static id = 'editor:scenario_manager'

  static dependencies = [AppComponents, Confirm, ContextMenu, BaseButton]

  constructor({ app }) {
    super(arguments)

    app.component('ScenarioManager', ScenarioManager)
  }
}
