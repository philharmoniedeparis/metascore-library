import AbstractModule from '@core/services/module-manager/AbstractModule'
import AppComponents from '@core/modules/app_components'
import ComponentsLibrary from './components/ComponentsLibrary.vue'

export default class ComponentsLibraryModule extends AbstractModule {
  static id = 'editor:components_library'

  static dependencies = [AppComponents]

  constructor({ app }) {
    super(arguments)

    app.component('ComponentsLibrary', ComponentsLibrary)
  }
}
