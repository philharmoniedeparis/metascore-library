import { defineStore } from 'pinia'
import { getLocale } from '@core/services/i18n'
import Blockly from '../blockly'
import '../blockly/generators'
import { javascriptGenerator as JavaScript } from 'blockly/javascript'

import * as interpreter from '../blockly/interpreter'

export default defineStore('app-behaviors', {
  state: () => {
    return {
      behaviors: {},
      enabled: false,
    }
  },
  actions: {
    async init(data) {
      // Import the locale.
      const locale = getLocale()
      const { default: blocklyLocale } = await import(
        /* webpackMode: "lazy" */
        /* webpackChunkName: "blockly-locale-[request]" */
        `../blockly/msg/${locale}.js`
      )

      Blockly.setLocale(blocklyLocale)

      await import('../blockly/blocks')

      this.behaviors = data || {}
    },
    update(value) {
      this.behaviors = value

      if (this.enabled) {
        this.run()
      }
    },
    run() {
      const workspace = new Blockly.Workspace()
      Blockly.serialization.workspaces.load(this.behaviors, workspace)

      const code = JavaScript.workspaceToCode(workspace)
      interpreter.exec(code)
    },
    enable() {
      this.enabled = true
      this.run()
    },
    disable() {
      this.enabled = false
      interpreter.reset()
    },
  },
})
