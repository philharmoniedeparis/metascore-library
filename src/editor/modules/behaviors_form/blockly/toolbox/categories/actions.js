import { merge } from "lodash";
import { useModule } from "@core/services/module-manager";

export function getBlocks() {
  const { findComponent, getModelByType } = useModule("core:app_components");

  // Hide
  const hideable_component = findComponent((c) => {
    const model = getModelByType(c.type);
    return model.$isHideable;
  });
  let hide_block = {
    kind: "block",
    type: "components_set_property",
    fields: { PROPERTY: "hidden" },
    inputs: {
      VALUE: {
        block: { type: "logic_boolean", fields: { BOOL: "TRUE" } },
      },
    },
    extraState: { property: "hidden" },
  };
  merge(
    hide_block,
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
      : { type: "components_set_property_mock" }
  );

  // Show
  const show_block = merge({}, hide_block, {
    inputs: {
      VALUE: {
        block: { fields: { BOOL: "FALSE" } },
      },
    },
  });

  // Background color
  const backgroundable_component = findComponent((c) => {
    const model = getModelByType(c.type);
    return model.$isBackgroundable;
  });
  let background_color_block = {
    kind: "block",
    type: "components_set_property",
    fields: { PROPERTY: "background-color" },
    inputs: {
      VALUE: {
        block: { type: "colour_picker" },
      },
    },
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
      : { type: "components_set_property_mock" }
  );

  // Scenario
  const scenario_component = findComponent((c) => {
    return c.type === "Scenario";
  });

  return [
    {
      kind: "block",
      type: "media_play",
      gap: 5,
    },
    {
      kind: "block",
      type: "media_play_excerpt",
      inputs: {
        FROM: { block: { type: "media_timecode" } },
        TO: { block: { type: "media_timecode" } },
      },
      gap: 5,
    },
    {
      kind: "block",
      type: "media_pause",
      gap: 5,
    },
    {
      kind: "block",
      type: "media_stop",
      gap: 5,
    },
    {
      kind: "block",
      type: "media_set_time",
      inputs: {
        VALUE: { block: { type: "media_timecode" } },
      },
      gap: 5,
    },
    {
      kind: "block",
      type: "components_set_scenario",
      inputs: {
        COMPONENT: {
          block: {
            type: "components_component",
            fields: {
              COMPONENT: scenario_component
                ? `Scenario:${scenario_component.id}`
                : null,
            },
          },
        },
      },
      gap: 5,
    },
    {
      ...hide_block,
      gap: 5,
    },
    {
      ...show_block,
      gap: 5,
    },
    {
      ...background_color_block,
      gap: 5,
    },
    { kind: "block", type: "components_set_property", gap: 5 },
    {
      kind: "block",
      type: "components_set_block_page",
      inputs: {
        INDEX: { block: { type: "math_number" } },
      },
      gap: 5,
    },
    {
      kind: "block",
      type: "links_open_url",
      inputs: {
        URL: { block: { type: "text" } },
      },
      gap: 5,
    },
    {
      kind: "block",
      type: "app_enter_fullscreen",
      gap: 5,
    },
    {
      kind: "block",
      type: "app_exit_fullscreen",
      gap: 5,
    },
    {
      kind: "block",
      type: "app_toggle_fullscreen",
      gap: 5,
    },
    {
      kind: "block",
      type: "app_reset",
    },
  ];
}
