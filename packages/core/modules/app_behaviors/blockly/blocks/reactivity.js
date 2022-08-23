import { defineBlocksWithJsonArray } from "blockly/core";

defineBlocksWithJsonArray([
  {
    type: "reactivity_when",
    message0: "%{BKY_REACTIVITY_WHEN}",
    args0: [
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
    inputsInline: true,
    style: "trigger_blocks",
    tooltip: "%{BKY_REACTIVITY_WHEN_TOOLTIP}",
    helpUrl: "%{BKY_REACTIVITY_WHEN_HELPURL}",
  },
]);
