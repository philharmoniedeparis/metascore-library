import Blockly from "blockly/core";

export default Blockly.Theme.defineTheme("metaScore", {
  base: Blockly.Themes.Classic,
  componentStyles: {
    workspaceBackgroundColour: "#1e1e1e",
    toolboxBackgroundColour: "blackBackground",
    toolboxForegroundColour: "#fff",
    flyoutBackgroundColour: "#252526",
    flyoutForegroundColour: "#ccc",
    flyoutOpacity: 1,
    scrollbarColour: "#797979",
    insertionMarkerColour: "#fff",
    insertionMarkerOpacity: 0.3,
    scrollbarOpacity: 0.4,
    cursorColour: "#d0d0d0",
    blackBackground: "#333",
  },
  fontStyle: {
    family: "'SourceSansPro', 'Source-Sans-Pro', 'Source Sans Pro', sans-serif",
    weight: "bold",
    size: 12,
  },
  categoryStyles: {
    triggers: {
      colour: "#00dd00",
    },
    logic: {
      colour: "#ff4e00",
    },
    math: {
      colour: "#ff4e00",
    },
    actions: {
      colour: "#ffb600",
    },
    variables: {
      colour: "#ffffff",
    },
  },
  blockStyles: {
    trigger_blocks: {
      colourPrimary: "#017501",
      colourSecondary: "#00dd00",
      colourTertiary: "#01b801",
    },
    logic_blocks: {
      colourPrimary: "#ff4e00",
      colourSecondary: "#64C7FF",
      colourTertiary: "#C5EAFF",
    },
    actions: {
      colourPrimary: "#ffb600",
      colourSecondary: "#64C7FF",
      colourTertiary: "#C5EAFF",
    },
    variable_blocks: {
      colourPrimary: "#ffffff",
      colourSecondary: "#ffffff",
      colourTertiary: "#ffffff",
    },
  },
});
