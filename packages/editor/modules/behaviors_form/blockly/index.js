import Theme from "../blockly/theme";
import { Msg, Variables } from "blockly/core";
import "../blockly/renderer";
import Flyout from "../blockly/plugins/flyout";
import {
  ContinuousToolbox,
  ContinuousMetrics,
} from "@blockly/continuous-toolbox";
import "@blockly/block-plus-minus";

import { getBlocks as getTriggerBlocks } from "./toolbox/categories/triggers";
import { getBlocks as getActionBlocks } from "./toolbox/categories/actions";
import { getBlocks as getLogicBlocks } from "./toolbox/categories/logic";
import { getBlocks as getMathBlocks } from "./toolbox/categories/math";
import { getBlocks as getTextBlocks } from "./toolbox/categories/text";
import { getBlocks as getColorBlocks } from "./toolbox/categories/color";
import { getBlocks as getAppBlocks } from "./toolbox/categories/app";
import { getBlocks as getMediaBlocks } from "./toolbox/categories/media";
import { getBlocks as getComponentBlocks } from "./toolbox/categories/components";
import { registerCallbacks as registerVariableCallbacks } from "./toolbox/categories/variables";
import { getBlocks as getPresetBlocks } from "./toolbox/categories/presets";

class Toolbox extends ContinuousToolbox {
  constructor(workspace) {
    registerVariableCallbacks(workspace);
    super(workspace);
  }
}

export function getConfig(publicPath = "") {
  return {
    theme: Theme,
    renderer: "metascore_renderer",
    media: `${publicPath}blockly/media/`,
    grid: {
      spacing: 100,
      length: 100,
      colour: "rgba(255, 255, 255, 0.25)",
      snap: true,
    },
    move: {
      scrollbars: {
        horizontal: true,
        vertical: true,
      },
      drag: true,
      wheel: true,
    },
    zoom: {
      controls: true,
      wheel: false,
      pinch: true,
      startScale: 0.675,
      maxScale: 1,
      minScale: 0.3,
      scaleSpeed: 1.2,
    },
    plugins: {
      toolbox: Toolbox,
      flyoutsVerticalToolbox: Flyout,
      metricsManager: ContinuousMetrics,
    },
    toolbox: {
      // Defer the creation of the toolbox
      // to allow registering custom categories.
      kind: "categoryToolbox",
      contents: [
        {
          kind: "category",
          name: Msg.CATEGORIES_TRIGGERS,
          categorystyle: "triggers_category",
          contents: getTriggerBlocks(),
        },
        {
          kind: "category",
          name: Msg.CATEGORIES_ACTIONS,
          categorystyle: "actions_category",
          contents: getActionBlocks(),
        },
        {
          kind: "category",
          name: Msg.CATEGORIES_LOGIC,
          categorystyle: "logic_category",
          contents: getLogicBlocks(),
        },
        {
          kind: "category",
          name: Msg.CATEGORIES_MATH,
          categorystyle: "math_category",
          contents: getMathBlocks(),
        },
        {
          kind: "category",
          name: Msg.CATEGORIES_TEXT,
          categorystyle: "text_category",
          contents: getTextBlocks(),
        },
        {
          kind: "category",
          name: Msg.CATEGORIES_COLOR,
          categorystyle: "color_category",
          contents: getColorBlocks(),
        },
        {
          kind: "category",
          name: Msg.CATEGORIES_APP,
          categorystyle: "app_category",
          contents: getAppBlocks(),
        },
        {
          kind: "category",
          name: Msg.CATEGORIES_MEDIA,
          categorystyle: "media_category",
          contents: getMediaBlocks(),
        },
        {
          kind: "category",
          name: Msg.CATEGORIES_COMPONENTS,
          categorystyle: "components_category",
          contents: getComponentBlocks(),
        },
        {
          kind: "category",
          name: Msg.CATEGORIES_LISTS,
          categorystyle: "lists_category",
          contents: getListBlocks(),
        },
        {
          kind: "category",
          name: Msg.CATEGORIES_VARIABLES,
          categorystyle: "variables_category",
          custom: Variables.CATEGORY_NAME,
        },
        {
          kind: "category",
          name: Msg.CATEGORIES_PRESETS,
          categorystyle: "presets_category",
          contents: getPresetBlocks(),
        },
      ],
    },
  };
}
