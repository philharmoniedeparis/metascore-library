import { default as Blockly, Themes, Theme } from "blockly/core";

Blockly.HSV_SATURATION = 0.99;
Blockly.HSV_VALUE = 0.9;

const category_colors = {
  triggers: "120",
  logic: "18",
  math: "18",
  text: "18",
  color: "18",
  actions: "43",
  media: "43",
  components: "43",
  variables: "180",
  presets: "43",
};

export default Theme.defineTheme("metaScore", {
  base: Themes.Classic,
  componentStyles: {
    workspaceBackgroundColour: "#3f3f3f",
    flyoutBackgroundColour: "#777",
    flyoutForegroundColour: "#fff",
    flyoutOpacity: 1,
    insertionMarkerColour: "#fff",
    insertionMarkerOpacity: 0.3,
    scrollbarColour: "#606060",
    scrollbarOpacity: 0.75,
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
      colour: category_colors.triggers,
    },
    logic_category: {
      colour: category_colors.logic,
    },
    math_category: {
      colour: category_colors.math,
    },
    text_category: {
      colour: category_colors.text,
    },
    color_category: {
      colour: category_colors.color,
    },
    actions_category: {
      colour: category_colors.actions,
    },
    media_category: {
      colour: category_colors.media,
    },
    components_category: {
      colour: category_colors.components,
    },
    variables_category: {
      colour: category_colors.variables,
    },
    presets_category: {
      colour: category_colors.presets,
    },
  },
  blockStyles: {
    trigger_blocks: {
      colourPrimary: category_colors.triggers,
      hat: "cap",
    },
    actions_blocks: {
      colourPrimary: category_colors.actions,
    },
    logic_blocks: {
      colourPrimary: category_colors.logic,
    },
    math_blocks: {
      colourPrimary: category_colors.math,
    },
    text_blocks: {
      colourPrimary: category_colors.text,
    },
    color_blocks: {
      colourPrimary: category_colors.color,
    },
    media_blocks: {
      colourPrimary: category_colors.media,
    },
    component_blocks: {
      colourPrimary: category_colors.components,
    },
    variable_blocks: {
      colourPrimary: category_colors.variables,
    },
  },
});
