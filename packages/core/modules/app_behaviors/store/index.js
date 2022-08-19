import { defineStore } from "pinia";
import { Workspace, serialization, JavaScript } from "blockly/core";
import "../blockly/generators";
import * as interpreter from "../blockly/interpreter";

export default defineStore("app-behaviors", {
  state: () => {
    return {
      behaviors: {},
      components: {},
    };
  },
  actions: {
    init(data) {
      this.behaviors = data || {};
    },
    update(value) {
      this.behaviors = value;

      const workspace = new Workspace();
      serialization.workspaces.load(this.behaviors, workspace);
      const code = JavaScript.workspaceToCode(workspace);

      interpreter.exec(code);
    },
  },
});
