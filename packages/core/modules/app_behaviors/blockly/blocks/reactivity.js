import { defineBlocksWithJsonArray, Extensions, Msg } from "blockly/core";
import { createMinusField } from "@blockly/block-plus-minus/src/field_minus";
import { createPlusField } from "@blockly/block-plus-minus/src/field_plus";

defineBlocksWithJsonArray([
  {
    type: "reactivity_when",
    message0: "%{BKY_REACTIVITY_WHEN}",
    args0: [
      {
        type: "input_dummy",
        name: "PLUS_MINUS",
      },
      {
        type: "input_value",
        name: "CONDITION",
        check: "Boolean",
      },
    ],
    message1: "%{BKY_REACTIVITY_WHEN_THEN}",
    args1: [
      {
        type: "input_statement",
        name: "STATEMENT",
      },
    ],
    mutator: "reactivity_when_mutator",
    inputsInline: true,
    style: "trigger_blocks",
    tooltip: "%{BKY_REACTIVITY_WHEN_TOOLTIP}",
    helpUrl: "%{BKY_REACTIVITY_WHEN_HELPURL}",
  },
  // Block representing the else statement in the reactivity_when mutator.
  {
    type: "reactivity_when_else",
    message0: "%{BKY_REACTIVITY_WHEN_ELSE}",
    previousStatement: null,
    enableContextMenu: false,
    style: "trigger_blocks",
    tooltip: "%{BKY_REACTIVITY_WHEN_ELSE_TOOLTIP}",
    helpUrl: "%{BKY_REACTIVITY_WHEN_ELSE_HELPURL}",
  },
]);

/**
 * Mutator methods added to reactivity_when block.
 * @mixin
 * @augments Block
 * @readonly
 */
const REACTIVITY_WHEN_MUTATOR_MIXIN = {
  hasElse_: false,

  /**
   * Returns the state of this block as a JSON serializable object.
   * @return {?{hasElse: (boolean|undefined)}}
   *     The state of this block.
   */
  saveExtraState: function () {
    if (!this.hasElse_) {
      return null;
    }

    const data = {};
    if (this.hasElse_) {
      data.hasElse = true;
    }
    return data;
  },

  /**
   * Applies the given state to this block.
   * @param {*} state The state to apply to this block.
   */
  loadExtraState: function (state) {
    this.hasElse_ = state["hasElse"] || false;
    this.updateShape_();
  },

  /**
   * Callback for the plus field.
   */
  plus: function () {
    this.hasElse_ = true;
    this.updateShape_();
  },

  /**
   * Callback for the minus field.
   * @this {Blockly.Block}
   */
  minus: function () {
    this.hasElse_ = false;
    this.updateShape_();
  },

  /**
   * Modify this block to have the correct number of inputs.
   * @this {Block}
   * @private
   */
  updateShape_: function () {
    if (this.hasElse_) {
      // Update plus/minus buttons.
      if (this.getField("PLUS")) {
        this.getInput("PLUS_MINUS").removeField("PLUS");
      }
      if (!this.getField("MINUS")) {
        this.getInput("PLUS_MINUS").appendField(createMinusField(), "MINUS");
      }
      // Add "else" input.
      if (!this.getInput("ELSE")) {
        this.appendStatementInput("ELSE").appendField(
          Msg["REACTIVITY_WHEN_ELSE"]
        );
      }
    } else {
      // Update plus/minus buttons.
      if (!this.getField("PLUS")) {
        this.getInput("PLUS_MINUS").appendField(createPlusField(), "PLUS");
      }
      if (this.getField("MINUS")) {
        this.getInput("PLUS_MINUS").removeField("MINUS");
      }
      // Remove "else" input.
      if (this.getInput("ELSE")) {
        this.removeInput("ELSE");
      }
    }
  },
};

/**
 * Adds the initial plus button.
 * @this {Blockly.Block}
 */
const REACTIVITY_WHEN_MUTATOR_HELPER = function () {
  this.updateShape_();
};

Extensions.registerMutator(
  "reactivity_when_mutator",
  REACTIVITY_WHEN_MUTATOR_MIXIN,
  REACTIVITY_WHEN_MUTATOR_HELPER,
  ["reactivity_when_else"]
);
