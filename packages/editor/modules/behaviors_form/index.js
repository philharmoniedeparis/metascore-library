import AbstractModule from '@core/services/module-manager/AbstractModule'

import AppBehaviors from '@core/modules/app_behaviors'
import AppComponents from '@core/modules/app_components'
import MediaPlayer from '@core/modules/media_player'
import BehaviorsForm from './components/BehaviorsForm.vue'

export default class BehaviorsFormModule extends AbstractModule {
  static id = 'editor:behaviors-form'

  static dependencies = [AppBehaviors, AppComponents, MediaPlayer]

  constructor({ app }) {
    super(arguments)

    app.component('BehaviorsForm', BehaviorsForm)
  }
}
