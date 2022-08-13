import { defineBlocksWithJsonArray } from "blockly/core";
import { useModule } from "@metascore-library/core/services/module-manager";

function getComponentOptions(components, prefix = "") {
  const { getComponentsByType, getComponentChildren } =
    useModule("app_components");
  let options = [];

  if (typeof components === "undefined") {
    components = getComponentsByType("Scenario");
  }

  if (components.length > 0) {
    components.forEach((c) => {
      options.push([`${prefix} ${c.name || "untitled"}`, `${c.type}:${c.id}`]);

      const children = getComponentChildren(c);
      options = [...options, ...getComponentOptions(children, `—${prefix}`)];
    });
  }

  return options;
}

function getScenarioOptions() {
  const { getComponentsByType } = useModule("app_components");
  let options = [];

  const components = getComponentsByType("Scenario");

  if (components.length > 0) {
    components.forEach((c) => {
      options.push([c.name || "untitled", c.id]);
    });
  }

  return options;
}

defineBlocksWithJsonArray([
  {
    type: "components_click",
    message0: "%{BKY_COMPONENTS_CLICK}",
    args0: [
      {
        type: "field_dropdown",
        name: "COMPONENT",
        options: getComponentOptions,
      },
    ],
    message1: "%{BKY_COMPONENTS_CLICK_THEN}",
    args1: [
      {
        type: "input_statement",
        name: "STATEMENT",
      },
    ],
    style: "trigger_blocks",
    tooltip: "%{BKY_COMPONENTS_CLICK_TOOLTIP}",
    helpUrl: "%{BKY_COMPONENTS_CLICK_HELPURL}",
  },
  {
    type: "components_show",
    message0: "%{BKY_COMPONENTS_SHOW}",
    args0: [
      {
        type: "field_dropdown",
        name: "COMPONENT",
        options: getComponentOptions,
      },
    ],
    previousStatement: null,
    nextStatement: null,
    style: "actions_blocks",
    tooltip: "%{BKY_COMPONENTS_SHOW_TOOLTIP}",
    helpUrl: "%{BKY_COMPONENTS_SHOW_HELPURL}",
  },
  {
    type: "components_hide",
    message0: "%{BKY_COMPONENTS_HIDE}",
    args0: [
      {
        type: "field_dropdown",
        name: "COMPONENT",
        options: getComponentOptions,
      },
    ],
    previousStatement: null,
    nextStatement: null,
    style: "actions_blocks",
    tooltip: "%{BKY_COMPONENTS_HIDE_TOOLTIP}",
    helpUrl: "%{BKY_COMPONENTS_HIDE_HELPURL}",
  },
  {
    type: "components_set_scenario",
    message0: "%{BKY_COMPONENTS_SET_SCENARIO}",
    args0: [
      {
        type: "field_dropdown",
        name: "ID",
        options: getScenarioOptions,
      },
    ],
    previousStatement: null,
    nextStatement: null,
    style: "actions_blocks",
    tooltip: "%{BKY_COMPONENTS_SET_SCENARIO_TOOLTIP}",
    helpUrl: "%{BKY_COMPONENTS_SET_SCENARIO_HELPURL}",
  },
]);
