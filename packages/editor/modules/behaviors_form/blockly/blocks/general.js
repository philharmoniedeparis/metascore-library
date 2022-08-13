import { defineBlocksWithJsonArray } from "blockly/core";

defineBlocksWithJsonArray([
  {
    type: "general_startup",
    message0: "%{BKY_GENERAL_STARTUP}",
    message1: "%{BKY_GENERAL_STARTUP_THEN}",
    args1: [
      {
        type: "input_statement",
        name: "STATEMENT",
      },
    ],
    style: "trigger_blocks",
    tooltip: "%{BKY_GENERAL_STARTUP_TOOLTIP}",
    helpUrl: "%{BKY_GENERAL_STARTUP_HELPURL}",
  },
]);
