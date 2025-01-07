import {
  Blocks,
  defineBlocksWithJsonArray,
  utils,
  Extensions,
} from "blockly/core";
import { createMinusField } from "@blockly/block-plus-minus/src/field_minus";
import { createPlusField } from "@blockly/block-plus-minus/src/field_plus";

/**
 * Overrides the default variables_get and variables_set blocks from https://github.com/google/blockly/blob/2c29c01b14fd9cec9f7fde82f6c80b6f4f7b7c30/blocks/variables.ts
 */

delete Blocks["variables_get"];
delete Blocks["variables_set"];

defineBlocksWithJsonArray([
  // Overrider block for variable getter.
  {
    type: "variables_get",
    message0: "%1",
    args0: [
      {
        type: "field_variable",
        name: "VAR",
        variable: "%{BKY_VARIABLES_DEFAULT_NAME}",
        variableTypes: [""],
        defaultType: "",
      },
    ],
    output: null,
    style: "variable_blocks",
    helpUrl: "%{BKY_VARIABLES_GET_HELPURL}",
    tooltip: "%{BKY_VARIABLES_GET_TOOLTIP}",
    extensions: ["contextMenu_variableSetterGetter"],
  },
  // Overrider block for variable setter.
  {
    type: "variables_set",
    message0: "%{BKY_VARIABLES_SET}",
    args0: [
      {
        type: "field_variable",
        name: "VAR",
        variable: "%{BKY_VARIABLES_DEFAULT_NAME}",
        variableTypes: [""],
        defaultType: "",
      },
      {
        type: "input_value",
        name: "VALUE",
      },
    ],
    previousStatement: null,
    nextStatement: null,
    style: "variable_blocks",
    tooltip: "%{BKY_VARIABLES_SET_TOOLTIP}",
    helpUrl: "%{BKY_VARIABLES_SET_HELPURL}",
    extensions: ["contextMenu_variableSetterGetter"],
  },
  {
    type: "lists_get",
    message0: "%{BKY_LISTS_GET}",
    args0: [
      {
        type: "field_variable",
        name: "VAR",
        variable: "%{BKY_VARIABLES_DEFAULT_NAME}",
        variableTypes: ["Array"],
        defaultType: "Array",
      },
    ],
    output: "Array",
    style: "variable_blocks",
    tooltip: "%{BKY_LISTS_GET_TOOLTIP}",
    extensions: ["contextMenu_variableSetterGetter"],
  },
  // Overrider block for variable setter.
  {
    type: "lists_set",
    message0: "%{BKY_LISTS_SET}",
    args0: [
      {
        type: "input_dummy",
        name: "PLUS_MINUS",
      },
      {
        type: "field_variable",
        name: "VAR",
        variable: "%{BKY_VARIABLES_DEFAULT_NAME}",
        variableTypes: ["Array"],
        defaultType: "Array",
      },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
    style: "variable_blocks",
    tooltip: "%{BKY_LISTS_SET_TOOLTIP}",
    extensions: ["contextMenu_variableSetterGetter"],
    mutator: "lists_set_mutator",
  },
  {
    type: "lists_add",
    message0: "%{BKY_LISTS_ADD}",
    args0: [
      {
        type: "input_value",
        name: "ITEM",
      },
      {
        type: "field_variable",
        name: "VAR",
        variable: "%{BKY_VARIABLES_DEFAULT_NAME}",
        variableTypes: ["Array"],
        defaultType: "Array",
      },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
    style: "variable_blocks",
    tooltip: "%{BKY_LISTS_ADD_TOOLTIP}",
  },
  {
    type: "lists_empty",
    message0: "%{BKY_LISTS_EMPTY}",
    args0: [
      {
        type: "field_variable",
        name: "VAR",
        variable: "%{BKY_VARIABLES_DEFAULT_NAME}",
        variableTypes: ["Array"],
        defaultType: "Array",
      },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
    style: "variable_blocks",
    tooltip: "%{BKY_LISTS_EMPTY_TOOLTIP}",
  },
]);

const listSetMutator = {
  /**
   * Number of item inputs the block has.
   * @type {number}
   */
  itemCount_: 0,

  /**
   * Creates XML to represent number of text inputs.
   * @returns {!Element} XML storage element.
   * @this {Blockly.Block}
   */
  mutationToDom: function () {
    const container = utils.xml.createElement("mutation");
    container.setAttribute("items", this.itemCount_);
    return container;
  },
  /**
   * Parses XML to restore the text inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this {Blockly.Block}
   */
  domToMutation: function (xmlElement) {
    const targetCount = parseInt(xmlElement.getAttribute("items"), 10);
    this.updateShape_(targetCount);
  },

  /**
   * Returns the state of this block as a JSON serializable object.
   * @returns {{itemCount: number}} The state of this block, ie the item count.
   */
  saveExtraState: function () {
    return {
      itemCount: this.itemCount_,
    };
  },

  /**
   * Applies the given state to this block.
   * @param {*} state The state to apply to this block, ie the item count.
   */
  loadExtraState: function (state) {
    this.updateShape_(state["itemCount"]);
  },

  /**
   * Adds inputs to the block until it reaches the target number of inputs.
   * @param {number} targetCount The target number of inputs for the block.
   * @this {Blockly.Block}
   * @private
   */
  updateShape_: function (targetCount) {
    while (this.itemCount_ < targetCount) {
      this.addPart_();
    }
    while (this.itemCount_ > targetCount) {
      this.removePart_();
    }
    this.updateMinus_();
  },

  /**
   * Callback for the plus image. Adds an input to the end of the block and
   * updates the state of the minus.
   */
  plus: function () {
    this.addPart_();
    this.updateMinus_();

    // Add and connect new child block of the same type as the previous one.
    if (this.itemCount_ > 1) {
      try {
        const previousInput = this.getInput("ADD" + (this.itemCount_ - 2));
        const newInput = this.getInput("ADD" + (this.itemCount_ - 1));
        if (previousInput && newInput) {
          const targetBlock = previousInput?.connection.targetBlock();
          if (targetBlock) {
            const newTargetBlock = targetBlock.workspace.newBlock(
              targetBlock.type
            );
            newTargetBlock.initSvg();
            newTargetBlock.render();
            newInput.connection.connect(newTargetBlock.outputConnection);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  },

  /**
   * Callback for the minus image. Removes an input from the end of the block
   * and updates the state of the minus.
   */
  minus: function () {
    if (this.itemCount_ < 2) {
      return;
    }
    this.removePart_();
    this.updateMinus_();
  },

  // To properly keep track of indices we have to increment before/after adding
  // the inputs, and decrement the opposite.
  // Because we want our first input to be ADD0 (not ADD1) we increment after.

  /**
   * Adds an input to the end of the block. If the block currently has no
   * inputs it updates the top 'EMPTY' input to receive a block.
   * @this {Blockly.Block}
   * @private
   */
  addPart_: function () {
    this.appendEndRowInput("END_OF_ROW" + this.itemCount_);
    this.appendValueInput("ADD" + this.itemCount_);

    this.itemCount_++;
  },

  /**
   * Removes an input from the end of the block. If we are removing the last
   * input this updates the block to have an 'EMPTY' top input.
   * @this {Blockly.Block}
   * @private
   */
  removePart_: function () {
    this.itemCount_--;

    this.removeInput("END_OF_ROW" + this.itemCount_);
    this.removeInput("ADD" + this.itemCount_);
  },

  /**
   * Makes it so the minus is visible iff there is an input available to remove.
   * @private
   */
  updateMinus_: function () {
    const minusField = this.getField("MINUS");
    if (!minusField && this.itemCount_ > 1) {
      this.getInput("PLUS_MINUS").insertFieldAt(1, createMinusField(), "MINUS");
    } else if (minusField && this.itemCount_ < 2) {
      this.getInput("PLUS_MINUS").removeField("MINUS");
    }
  },
};

/**
 * Updates the shape of the block to have 3 inputs if no mutation is provided.
 * @this {Blockly.Block}
 */
const listSetHelper = function () {
  this.getInput("PLUS_MINUS").appendField(createPlusField(), "PLUS");
  this.updateShape_(3);
};

Extensions.registerMutator("lists_set_mutator", listSetMutator, listSetHelper);
