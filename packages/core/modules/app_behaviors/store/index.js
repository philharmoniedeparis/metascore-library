import { defineStore } from "pinia";
import { Workspace, serialization, JavaScript } from "blockly/core";
import "../blockly/generators";

export default defineStore("app-behaviors", {
  state: () => {
    return {
      behaviors: {},
    };
  },
  actions: {
    init({ behaviors }) {
      this.behaviors = behaviors;
    },
    setBehaviors(value) {
      this.behaviors = value;

      const workspace = new Workspace();
      serialization.workspaces.load(this.behaviors, workspace);
      const code = JavaScript.workspaceToCode(workspace);
      console.log(code);
    },
  },
});
