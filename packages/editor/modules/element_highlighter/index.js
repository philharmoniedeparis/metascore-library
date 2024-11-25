import AbstractModule from '@core/services/module-manager/AbstractModule'
import ElementHighlighter from './components/ElementHighlighter.vue'

export default class ElementHighlighterModule extends AbstractModule {
  static id = 'element_highlighter'

  constructor({ app }) {
    super(arguments)

    app.component('ElementHighlighter', ElementHighlighter)
  }
}
