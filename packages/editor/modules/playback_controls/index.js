import AbstractModule from '@core/services/module-manager/AbstractModule'
import MediaPlayer from '@core/modules/media_player'
import FormControls from '../form_controls'
import Hotkey from '../hotkey'
import BaseButton from '@core/modules/button'

import PlaybackController from './components/PlaybackController.vue'
import PlaybackTime from './components/PlaybackTime.vue'

export default class PlaybackControlsModule extends AbstractModule {
  static id = 'playback_controls'

  static dependencies = [MediaPlayer, FormControls, Hotkey, BaseButton]

  constructor({ app }) {
    super(arguments)

    app.component('PlaybackController', PlaybackController)
    app.component('PlaybackTime', PlaybackTime)
  }
}
