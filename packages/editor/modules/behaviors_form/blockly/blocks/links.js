import { defineBlocksWithJsonArray } from "blockly/core";

defineBlocksWithJsonArray([
  {
    type: "links_click",
    message0: "%{BKY_LINKS_CLICK}",
    args0: [
      {
        type: "field_dropdown",
        name: "ID",
        options: [["option", "OPTIONNAME"]],
      },
    ],
    nextStatement: "Boolean",
    style: "trigger_blocks",
    tooltip: "%{BKY_LINKS_CLICK_TOOLTIP}",
    helpUrl: "%{BKY_LINKS_CLICK_HELPURL}",
  },
]);
