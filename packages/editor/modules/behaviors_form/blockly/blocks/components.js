import { defineBlocksWithJsonArray } from "blockly/core";
import { useModule } from "@metascore-library/core/services/module-manager";

function getOptions(components) {
  const { getComponentsByType, getComponentChildren } =
    useModule("app_components");
  let options = [];

  if (typeof components === "undefined") {
    components = getComponentsByType("Scenario");
  }

  if (components.length > 0) {
    components.forEach((c) => {
      options.push([c.name || "untitled", `${c.type}:${c.id}`]);

      const children = getComponentChildren(c);
      options = [...options, ...getOptions(children)];
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
        options: getOptions,
      },
      {
        type: "input_dummy",
      },
      {
        type: "input_statement",
        name: "STATEMENT",
      },
    ],
    style: "trigger_blocks",
    tooltip: "%{BKY_COMPONENTS_CLICK_TOOLTIP}",
    helpUrl: "%{BKY_COMPONENTS_CLICK_HELPURL}",
  },
]);
