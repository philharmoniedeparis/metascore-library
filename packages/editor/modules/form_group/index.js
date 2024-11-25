import AbstractModule from '@core/services/module-manager/AbstractModule'
import FormGroup from './components/FormGroup.vue'

export default class FormGroupModule extends AbstractModule {
  static id = 'form_group'

  constructor({ app }) {
    super(arguments)

    app.component('FormGroup', FormGroup)
  }
}
