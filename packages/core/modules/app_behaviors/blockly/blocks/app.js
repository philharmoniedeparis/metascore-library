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
  {
    type: "app_enter_fullscreen",
    message0: "%{BKY_APP_ENTER_FULLSCREEN}",
    previousStatement: null,
    nextStatement: null,
    style: "actions_blocks",
    tooltip: "%{BKY_APP_ENTER_FULLSCREEN_TOOLTIP}",
    helpUrl: "%{BKY_APP_ENTER_FULLSCREEN_HELPURL}",
  },
  {
    type: "app_exit_fullscreen",
    message0: "%{BKY_APP_EXIT_FULLSCREEN}",
    previousStatement: null,
    nextStatement: null,
    style: "actions_blocks",
    tooltip: "%{BKY_APP_EXIT_FULLSCREEN_TOOLTIP}",
    helpUrl: "%{BKY_APP_EXIT_FULLSCREEN_HELPURL}",
  },
  {
    type: "app_toggle_fullscreen",
    message0: "%{BKY_APP_TOGGLE_FULLSCREEN}",
    previousStatement: null,
    nextStatement: null,
    style: "actions_blocks",
    tooltip: "%{BKY_APP_TOGGLE_FULLSCREEN_TOOLTIP}",
    helpUrl: "%{BKY_APP_TOGGLE_FULLSCREEN_HELPURL}",
  },
  {
    type: "app_get_idle_time",
    message0: "%{BKY_APP_GET_IDLE_TIME}",
    output: "Number",
    style: "app_blocks",
    tooltip: "%{BKY_APP_GET_IDLE_TIME_TOOLTIP}",
    helpUrl: "%{BKY_APP_GET_IDLE_TIME_HELPURL}",
  },
  {
    type: "app_reset",
    message0: "%{BKY_APP_RESET}",
    previousStatement: null,
    nextStatement: null,
    style: "actions_blocks",
    tooltip: "%{BKY_APP_RESET_TOOLTIP}",
    helpUrl: "%{BKY_APP_RESET_HELPURL}",
  },
]);
