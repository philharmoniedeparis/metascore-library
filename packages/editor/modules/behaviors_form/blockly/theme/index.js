import { default as Blockly, Themes, Theme, Css } from "blockly/core";

Blockly.HSV_SATURATION = 0.99;
Blockly.HSV_VALUE = 0.9;

export default Theme.defineTheme("metaScore", {
  base: Themes.Classic,
  componentStyles: {
    workspaceBackgroundColour: "#3f3f3f",
    flyoutBackgroundColour: "#777",
    flyoutForegroundColour: "#fff",
    flyoutOpacity: 1,
    insertionMarkerColour: "#fff",
    insertionMarkerOpacity: 0.3,
    scrollbarColour: "#797979",
    scrollbarOpacity: 0.4,
    cursorColour: "#d0d0d0",
  },
  fontStyle: {
    family:
      "'Source Sans 3 VF', 'Source Sans Variable', 'Source Sans Pro', sans-serif",
    weight: "normal",
    size: 16,
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
    text_category: {
      colour: "18",
    },
    color_category: {
      colour: "18",
    },
    actions_category: {
      colour: "43",
    },
    media_category: {
      colour: "43",
    },
    components_category: {
      colour: "43",
    },
    variables_category: {
      colour: "180",
    },
    presets_category: {
      colour: "43",
    },
  },
  blockStyles: {
    trigger_blocks: {
      colourPrimary: "120",
      hat: "cap",
    },
    actions_blocks: {
      colourPrimary: "43",
    },
    logic_blocks: {
      colourPrimary: "18",
    },
    math_blocks: {
      colourPrimary: "18",
    },
    text_blocks: {
      colourPrimary: "18",
    },
    color_blocks: {
      colourPrimary: "18",
    },
    media_blocks: {
      colourPrimary: "18",
    },
    component_blocks: {
      colourPrimary: "18",
    },
    variable_blocks: {
      colourPrimary: "180",
    },
  },
});

Css.register(
  `
  .blocklyWidgetDiv .blocklyMenu {
    background: #3f3f3f;
    padding: 0.25em;
    box-sizing: content-box;
    border: 1px solid #777;
    box-shadow: 0.25em 0.25em 0.5em 0 rgba(0, 0, 0, 0.5);
  }
  .blocklyMenuItem {
    color: #fff;
  }
  .blocklyMenuItemDisabled {
    opacity: 0.5;
  }
  .blocklyContextMenu {
    border-radius: 0;
  }
  `
);
