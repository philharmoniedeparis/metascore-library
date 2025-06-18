import { defineStore } from "pinia";
import { markRaw } from "vue";
import { getLocale } from "@core/services/i18n";
import Blockly from "../blockly";
import "../blockly/generators";
import { javascriptGenerator as JavaScript } from "blockly/javascript";

import * as interpreter from "../blockly/interpreter";

export default defineStore("app-behaviors", {
  state: () => {
    return {
      behaviors: {},
      workspace: null,
      enabled: false,
    };
  },
  actions: {
    async init(data) {
      // Import the locale.
      const locale = getLocale();
      const { default: blocklyLocale } = await import(
        /* webpackMode: "lazy" */
        /* webpackChunkName: "blockly-locale-[request]" */
        `../blockly/msg/${locale}.js`
      );

      Blockly.setLocale(blocklyLocale);

      await import("../blockly/blocks");

      this.behaviors = data || {};
    },
    update(value) {
      this.behaviors = value;

      if (this.enabled) {
        this.run();
      }
    },
    run() {
      this.workspace = markRaw(new Blockly.Workspace());
      Blockly.serialization.workspaces.load(this.behaviors, this.workspace);

      const code = JavaScript.workspaceToCode(this.workspace);
      interpreter.exec(code);
    },
    getVariable(name) {
      const variable = this.workspace.getVariableMap().getVariable(name);
      return interpreter.getContext()?.Variables?.store.value.get(variable.getId());
    },
    setVariable(name, value) {
      const variable = this.workspace.getVariableMap().getVariable(name);
      interpreter.getContext()?.Variables?.store.value.set(variable.getId(), value);
    },
    enable() {
      this.enabled = true;
      this.run();
    },
    disable() {
      this.enabled = false;
      this.workspace = null;
      interpreter.reset();
    },
  },
});
