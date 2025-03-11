import Theme from "../blockly/theme";
import { Msg } from "blockly/core";
import "../blockly/renderer";
import Flyout from "../blockly/plugins/flyout";
import {
  ContinuousToolbox,
  ContinuousMetrics,
} from "@blockly/continuous-toolbox";
import "@blockly/block-plus-minus";

import { default as getTriggerBlocks } from "./toolbox/categories/triggers";
import { default as getActionBlocks } from "./toolbox/categories/actions";
import { default as getLogicBlocks } from "./toolbox/categories/logic";
import { default as getMathBlocks } from "./toolbox/categories/math";
import { default as getTextBlocks } from "./toolbox/categories/text";
import { default as getColorBlocks } from "./toolbox/categories/color";
import { default as getAppBlocks } from "./toolbox/categories/app";
import { default as getMediaBlocks } from "./toolbox/categories/media";
import { default as getComponentBlocks } from "./toolbox/categories/components";
import { default as getPresetBlocks } from "./toolbox/categories/presets";

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
      toolbox: ContinuousToolbox,
      flyoutsVerticalToolbox: Flyout,
      metricsManager: ContinuousMetrics,
    },
    toolbox: {
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
          name: Msg.CATEGORIES_VARIABLES,
          categorystyle: "variables_category",
          custom: "VARIABLE",
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
