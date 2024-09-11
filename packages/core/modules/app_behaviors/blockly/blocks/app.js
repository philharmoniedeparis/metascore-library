import { defineBlocksWithJsonArray } from "blockly/core";

defineBlocksWithJsonArray([
  {
    type: "multiselect_test",
    message0: "%1",
    args0: [
      {
        type: "field_multiselect",
        options: [
          ["Option 1", "option_1"],
          ["Option 2", "option_2"],
          ["Option 3", "option_3"],
        ],
        multiple: true,
        searchable: true,
        name: "SELECT",
      },
    ],
    style: "media_blocks",
    helpUrl: "%{BKY_MEDIA_TIMECODE_HELPURL}",
    tooltip: "%{BKY_MEDIA_TIMECODE_TOOLTIP}",
    extensions: ["parent_tooltip_when_inline"],
  },
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
]);
