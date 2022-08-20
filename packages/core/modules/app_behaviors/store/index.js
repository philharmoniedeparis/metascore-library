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
      const workspace = new Workspace();
      serialization.workspaces.load(this.behaviors, workspace);

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
      this.components = {};
    },
    setComponentState(type, id, state) {
      this.components[type] = this.components[type] || {};
      this.components[type][id] = this.components[type][id] || {};

      assign(this.components[type][id], state);
    },
  },
});
