import { defineBlocksWithJsonArray } from "blockly/core";

defineBlocksWithJsonArray([
  {
    type: "reactivity_watch",
    message0: "%{BKY_REACTIVITY_WATCH}",
    args0: [
      {
        type: "input_value",
        name: "CONDITION",
        check: "Boolean",
      },
    ],
    inputsInline: true,
    nextStatement: "Boolean",
    style: "trigger_blocks",
    tooltip: "%{BKY_REACTIVITY_WATCH_TOOLTIP}",
    helpUrl: "%{BKY_REACTIVITY_WATCH_HELPURL}",
  },
]);
