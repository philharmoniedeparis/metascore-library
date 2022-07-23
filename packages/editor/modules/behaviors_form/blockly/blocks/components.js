import { defineBlocksWithJsonArray } from "blockly/core";

defineBlocksWithJsonArray([
  {
    type: "components_click",
    message0: "%{BKY_COMPONENTS_CLICK}",
    args0: [
      {
        type: "field_dropdown",
        name: "ID",
        options: [["option", "OPTIONNAME"]],
      },
      {
        type: "input_dummy",
      },
      {
        type: "input_statement",
        name: "STATEMENT",
      },
    ],
    nextStatement: "Boolean",
    style: "trigger_blocks",
    tooltip: "%{BKY_COMPONENTS_CLICK_TOOLTIP}",
    helpUrl: "%{BKY_COMPONENTS_CLICK_HELPURL}",
  },
]);
