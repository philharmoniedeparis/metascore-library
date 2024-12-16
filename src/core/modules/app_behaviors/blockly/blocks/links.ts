import { defineBlocksWithJsonArray } from "blockly/core";

defineBlocksWithJsonArray([
  // Click.
  {
    type: "links_click",
    message0: "%{BKY_LINKS_CLICK}",
    args0: [
      {
        type: "input_value",
        name: "TRIGGER",
        check: ["Component", "BehaviorTrigger", "Array"],
      },
    ],
    message1: "%{BKY_LINKS_CLICK_THEN}",
    args1: [
      {
        type: "input_statement",
        name: "STATEMENT",
      },
    ],
    style: "trigger_blocks",
    tooltip: "%{BKY_LINKS_CLICK_TOOLTIP}",
    helpUrl: "%{BKY_LINKS_CLICK_HELPURL}",
  },
  {
    type: "links_open_url",
    message0: "%{BKY_LINKS_OPEN_URL}",
    args0: [
      {
        type: "input_value",
        name: "URL",
        check: "String",
      },
    ],
    previousStatement: null,
    nextStatement: null,
    style: "actions_blocks",
    helpUrl: "%{BKY_LINKS_OPEN_URL_HELPURL}",
  },
]);
