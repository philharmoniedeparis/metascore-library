import { defineBlocksWithJsonArray } from "blockly/core";

defineBlocksWithJsonArray([
  {
    type: "app_startup",
    message0: "%{BKY_APP_STARTUP}",
    message1: "%{BKY_APP_STARTUP_THEN}",
    args1: [
      {
        type: "input_statement",
        name: "STATEMENT",
      },
    ],
    style: "trigger_blocks",
    tooltip: "%{BKY_APP_STARTUP_TOOLTIP}",
    helpUrl: "%{BKY_APP_STARTUP_HELPURL}",
  },
]);
