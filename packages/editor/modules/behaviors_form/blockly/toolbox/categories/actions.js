import { merge } from "lodash";
import { useModule } from "@core/services/module-manager";

export default function getBlocks() {
  const { findComponent, getModelByType } = useModule("app_components");

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
          fields: {
            COMPONENT: `${hideable_component.type}:${hideable_component.id}`,
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
          fields: {
            COMPONENT: `${backgroundable_component.type}:${backgroundable_component.id}`,
          },
        }
      : { type: "components_set_property_mock" }
  );

  return [
    { kind: "block", type: "media_play" },
    {
      kind: "block",
      type: "media_play_excerpt",
      inputs: {
        FROM: { block: { type: "media_timecode" } },
        TO: { block: { type: "media_timecode" } },
      },
    },
    { kind: "block", type: "media_pause" },
    { kind: "block", type: "media_stop" },
    {
      kind: "block",
      type: "media_set_time",
      inputs: {
        VALUE: { block: { type: "math_number" } },
      },
    },
    { kind: "block", type: "components_set_scenario" },
    hide_block,
    show_block,
    background_color_block,
    { kind: "block", type: "components_set_property" },
    {
      kind: "block",
      type: "components_set_block_page",
      inputs: {
        INDEX: { block: { type: "math_number" } },
      },
    },
    {
      kind: "block",
      type: "links_open_url",
      inputs: {
        URL: { block: { type: "text" } },
      },
    },
    {
      kind: "block",
      type: "app_enter_fullscreen",
    },
    {
      kind: "block",
      type: "app_exit_fullscreen",
    },
    {
      kind: "block",
      type: "app_toggle_fullscreen",
    },
  ];
}
