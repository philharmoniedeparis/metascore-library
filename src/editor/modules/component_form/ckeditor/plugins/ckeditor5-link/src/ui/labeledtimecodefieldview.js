import { LabeledFieldView, ButtonView, ToolbarView } from 'ckeditor5'
import { useModule } from '@core/services/module-manager'
import { unref } from 'vue'
import { createLabeledInputTimecode } from './utils'

import clearIcon from '../../theme/icons/clear.svg?raw'
import inIcon from '../../theme/icons/in.svg?raw'
import outIcon from '../../theme/icons/out.svg?raw'

import '../../theme/labeledtimecodefield.scss'

/**
 * The labeled timecode field view class.
 */
export default class LabeledTimecodeFieldView extends LabeledFieldView {
  /**
   * Creates an instance of the labeled field view.
   *
   * @param {module:utils/locale~Locale} locale The {@link module:core/editor/editor~Editor#locale} instance.
   * @param {Object} [options] The options of the input.
   * @param {Boolean} [options.in_button=true] Whether to add the 'in' button.
   * @param {Boolean} [options.out_button=true] Whether to add the 'out' button.
   * @param {Boolean} [options.clear_button=true] Whether to add the 'clear' button.
   */
  constructor(locale, { in_button = true, out_button = true, clear_button = true } = {}) {
    super(locale, createLabeledInputTimecode)

    const t = locale.t
    const { time: mediaTime, seekTo: seekMediaTo } = useModule('media_player')

    this.toolbarView = null

    const buttons = []

    if (in_button) {
      this.inButton = new ButtonView(locale)
      this.inButton.set({
        icon: inIcon,
        tooltip: t('Set value to current media time'),
      })
      this.inButton.on('execute', () => {
        this.fieldView.value = unref(mediaTime)
        this.fieldView.fire('input')
      })
      buttons.push(this.inButton)
    }

    if (out_button) {
      this.outButton = new ButtonView(locale)
      this.outButton.set({
        icon: outIcon,
        tooltip: t('Set current media time to this value'),
      })
      this.outButton.on('execute', () => {
        seekMediaTo(this.fieldView.value)
      })
      buttons.push(this.outButton)
    }

    if (clear_button) {
      this.clearButton = new ButtonView(locale)
      this.clearButton.set({
        icon: clearIcon,
        tooltip: t('Clear value'),
      })
      this.clearButton.on('execute', () => {
        this.fieldView.value = null
        this.fieldView.fire('input')
      })
      buttons.push(this.clearButton)
    }

    if (buttons.length > 0) {
      this.toolbarView = new ToolbarView(locale)
      this.toolbarView.items.addMany(buttons)
      this.fieldWrapperChildren.add(this.toolbarView)
    }

    this.extendTemplate({
      attributes: {
        class: ['ck-labeled-field-view_timecode'],
      },
    })
  }

  /**
   * @inheritdoc
   */
  render() {
    super.render()

    if (this.toolbarView) {
      this.fieldView.focusTracker.add(this.toolbarView.element)
    }
  }
}
