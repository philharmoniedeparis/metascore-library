import AbstractModule from '@core/services/module-manager/AbstractModule'
import FormControls from '../form_controls'
import ArrayControl from './components/ArrayControl.vue'
import ControlDispatcher from './components/ControlDispatcher.vue'
import SchemaForm from './components/SchemaForm.vue'

export default class SchemaFormModule extends AbstractModule {
  static id = 'editor:schema_form'

  static dependencies = [FormControls]

  constructor({ app }) {
    super(arguments)

    app.component('ArrayControl', ArrayControl)
    app.component('ControlDispatcher', ControlDispatcher)
    app.component('SchemaForm', SchemaForm)
  }
}
