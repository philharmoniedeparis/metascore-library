import { defineBlocksWithJsonArray } from "blockly/core";

defineBlocksWithJsonArray([
  {
    type: "media_get_time",
    message0: "%{BKY_VARIABLES_MEDIA_GET_TIME}",
    output: "Number",
    style: "variable_blocks",
    tooltip: "%{BKY_VARIABLES_MEDIA_GET_TIME_TOOLTIP}",
    helpUrl: "%{BKY_VARIABLES_MEDIA_GET_TIME_HELPURL}",
  },
  {
    type: "media_set_time",
    message0: "%{BKY_VARIABLES_MEDIA_SET_TIME}",
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
    tooltip: "%{BKY_VARIABLES_MEDIA_SET_TIME_TOOLTIP}",
    helpUrl: "%{BKY_VARIABLES_MEDIA_SET_TIME_HELPURL}",
  },
  {
    type: "media_play",
    message0: "%{BKY_VARIABLES_MEDIA_PLAY}",
    previousStatement: null,
    nextStatement: null,
    style: "actions_blocks",
    tooltip: "%{BKY_VARIABLES_MEDIA_PLAY_TOOLTIP}",
    helpUrl: "%{BKY_VARIABLES_MEDIA_PLAY_HELPURL}",
  },
  {
    type: "media_pause",
    message0: "%{BKY_VARIABLES_MEDIA_PAUSE}",
    previousStatement: null,
    nextStatement: null,
    style: "actions_blocks",
    tooltip: "%{BKY_VARIABLES_MEDIA_PAUSE_TOOLTIP}",
    helpUrl: "%{BKY_VARIABLES_MEDIA_PAUSE_HELPURL}",
  },
  {
    type: "media_stop",
    message0: "%{BKY_VARIABLES_MEDIA_STOP}",
    previousStatement: null,
    nextStatement: null,
    style: "actions_blocks",
    tooltip: "%{BKY_VARIABLES_MEDIA_STOP_TOOLTIP}",
    helpUrl: "%{BKY_VARIABLES_MEDIA_STOP_HELPURL}",
  },
]);
