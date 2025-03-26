import { merge } from "lodash";
import { useModule } from "@core/services/module-manager";

export function getBlocks() {
  const { findComponent, getModelByType } = useModule("app_components");

  // Hidden
  const hideable_component = findComponent((c) => {
    const model = getModelByType(c.type);
    return model.$isHideable;
  });
  let hidden_block = {
    kind: "block",
    type: "components_get_property",
    fields: { PROPERTY: "hidden" },
    extraState: { property: "hidden" },
  };
  merge(
    hidden_block,
    hideable_component
      ? {
          inputs: {
            COMPONENT: {
              block: {
                type: "components_component",
                fields: {
                  COMPONENT: `${hideable_component.type}:${hideable_component.id}`,
                },
              },
            },
          },
        }
      : { type: "components_get_property_mock" }
  );

  // Background color
  const backgroundable_component = findComponent((c) => {
    const model = getModelByType(c.type);
    return model.$isBackgroundable;
  });
  let background_color_block = {
    kind: "block",
    type: "components_get_property",
    fields: { PROPERTY: "background-color" },
    extraState: { property: "background-color" },
  };
  merge(
    background_color_block,
    backgroundable_component
      ? {
          inputs: {
            COMPONENT: {
              block: {
                type: "components_component",
                fields: {
                  COMPONENT: `${backgroundable_component.type}:${backgroundable_component.id}`,
                },
              },
            },
          },
        }
      : { type: "components_get_property_mock" }
  );

  return [
    {
      kind: "block",
      type: "components_component",
    },
    hidden_block,
    background_color_block,
    {
      kind: "block",
      type: "components_get_property",
    },
    {
      kind: "block",
      type: "components_get_block_page",
    },
    {
      kind: "block",
      type: "components_behaviour_trigger",
    },
  ];
}
