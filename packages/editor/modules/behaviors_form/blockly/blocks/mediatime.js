import { defineBlocksWithJsonArray } from "blockly/core";

defineBlocksWithJsonArray([
  {
    type: "mediatime_get",
    message0: "%{BKY_VARIABLES_MEDIATIME_GET}",
    output: "Number",
    style: "variable_blocks",
    tooltip: "%{BKY_VARIABLES_MEDIATIME_GET_TOOLTIP}",
    helpUrl: "%{BKY_VARIABLES_MEDIATIME_GET_HELPURL}",
  },
  {
    type: "mediatime_set",
    message0: "%{BKY_VARIABLES_MEDIATIME_SET}",
    args0: [
      {
        type: "input_value",
        name: "VALUE",
        check: "Number",
      },
    ],
    previousStatement: null,
    nextStatement: null,
    style: "variable_blocks",
    tooltip: "%{BKY_VARIABLES_MEDIATIME_SET_TOOLTIP}",
    helpUrl: "%{BKY_VARIABLES_MEDIATIME_SET_HELPURL}",
  },
]);
