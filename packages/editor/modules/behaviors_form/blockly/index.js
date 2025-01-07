import Theme from "../blockly/theme";
import { Variables } from "blockly/core";
import "../blockly/renderer";
import Flyout from "../blockly/plugins/flyout";
import {
  ContinuousToolbox,
  ContinuousMetrics,
} from "@blockly/continuous-toolbox";

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

export default function getConfig({ $t, publicPath = "" } = {}) {
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
          name: $t("categories.triggers"),
          categorystyle: "triggers_category",
          contents: getTriggerBlocks(),
        },
        {
          kind: "category",
          name: $t("categories.actions"),
          categorystyle: "actions_category",
          contents: getActionBlocks(),
        },
        {
          kind: "category",
          name: $t("categories.logic"),
          categorystyle: "logic_category",
          contents: getLogicBlocks(),
        },
        {
          kind: "category",
          name: $t("categories.math"),
          categorystyle: "math_category",
          contents: getMathBlocks(),
        },
        {
          kind: "category",
          name: $t("categories.text"),
          categorystyle: "text_category",
          contents: getTextBlocks(),
        },
        {
          kind: "category",
          name: $t("categories.color"),
          categorystyle: "color_category",
          contents: getColorBlocks(),
        },
        {
          kind: "category",
          name: $t("categories.app"),
          categorystyle: "app_category",
          contents: getAppBlocks(),
        },
        {
          kind: "category",
          name: $t("categories.media"),
          categorystyle: "media_category",
          contents: getMediaBlocks(),
        },
        {
          kind: "category",
          name: $t("categories.components"),
          categorystyle: "components_category",
          contents: getComponentBlocks(),
        },
        {
          kind: "category",
          name: $t("categories.variables"),
          categorystyle: "variables_category",
          custom: Variables.CATEGORY_NAME,
        },
        {
          kind: "category",
          name: $t("categories.presets"),
          categorystyle: "presets_category",
          contents: getPresetBlocks(),
        },
      ],
    },
  };
}
