export function getBlocks() {
  return [
    {
      kind: "block",
      type: "app_startup",
    },
    {
      kind: "block",
      type: "keyboard_keypressed",
    },
    {
      kind: "block",
      type: "links_click",
      inputs: {
        TRIGGER: { block: { type: "components_behaviour_trigger" } },
        STATEMENT: {},
      },
    },
    {
      kind: "block",
      type: "links_click",
      inputs: {
        TRIGGER: { block: { type: "components_component" } },
        STATEMENT: {},
      },
    },
    {
      kind: "block",
      type: "reactivity_when",
    },
  ];
}
