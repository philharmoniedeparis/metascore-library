import Blockly from "blockly/core";

Blockly.HSV_SATURATION = 0.99;
Blockly.HSV_VALUE = 0.99;

export default Blockly.Theme.defineTheme("metaScore", {
  base: Blockly.Themes.Classic,
  componentStyles: {
    workspaceBackgroundColour: "#606060",
    toolboxBackgroundColour: "#777",
    toolboxForegroundColour: "#fff",
    flyoutBackgroundColour: "#3c3c3c",
    flyoutForegroundColour: "#ccc",
    flyoutOpacity: 1,
    insertionMarkerColour: "#fff",
    insertionMarkerOpacity: 0.3,
    scrollbarColour: "#797979",
    scrollbarOpacity: 0.4,
    cursorColour: "#d0d0d0",
  },
  fontStyle: {
    weight: "normal",
    size: "14px",
  },
  categoryStyles: {
    triggers_category: {
      colour: "120",
    },
    logic_category: {
      colour: "18",
    },
    math_category: {
      colour: "18",
    },
    actions_category: {
      colour: "43",
    },
    variables_category: {
      colour: "180",
    },
  },
  blockStyles: {
    trigger_blocks: {
      colourPrimary: "120",
      hat: "cap",
    },
    logic_blocks: {
      colourPrimary: "18",
    },
    math_blocks: {
      colourPrimary: "18",
    },
    actions_blocks: {
      colourPrimary: "43",
    },
    variable_blocks: {
      colourPrimary: "180",
    },
  },
});
