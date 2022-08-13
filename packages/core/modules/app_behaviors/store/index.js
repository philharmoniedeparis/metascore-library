import { defineStore } from "pinia";
import { assign } from "lodash";
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
    init({ behaviors }) {
      this.behaviors = behaviors;
    },
    setBehaviors(value) {
      this.behaviors = value;

      const workspace = new Workspace();
      serialization.workspaces.load(this.behaviors, workspace);
      const code = JavaScript.workspaceToCode(workspace);

      console.log(code);

      interpreter.exec(code);
    },
    setComponentState(type, id, state) {
      this.components[type] = this.components[type] || {};
      this.components[type][id] = this.components[type][id] || {};

      assign(this.components[type][id], state);
    },
  },
});
