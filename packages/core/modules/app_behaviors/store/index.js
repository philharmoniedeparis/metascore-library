import { defineStore } from "pinia";
import Blockly from "../blockly";
import "../blockly/generators";
import { javascriptGenerator as JavaScript } from "blockly/javascript";

import * as interpreter from "../blockly/interpreter";

export default defineStore("app-behaviors", {
  state: () => {
    return {
      behaviors: {},
      enabled: false,
    };
  },
  actions: {
    init(data) {
      this.behaviors = data || {};
    },
    update(value) {
      this.behaviors = value;

      if (this.enabled) {
        this.run();
      }
    },
    run() {
      const workspace = new Blockly.Workspace();
      Blockly.serialization.workspaces.load(this.behaviors, workspace);

      const code = JavaScript.workspaceToCode(workspace);
      interpreter.exec(code);
    },
    enable() {
      this.enabled = true;
      this.run();
    },
    disable() {
      this.enabled = false;
      interpreter.reset();
    },
  },
});
