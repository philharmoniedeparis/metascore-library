export default function getBlocks() {
  return [
    { kind: "block", type: "app_startup" },
    { kind: "block", type: "keyboard_keypressed" },
    { kind: "block", type: "components_click" },
    { kind: "block", type: "links_click" },
    { kind: "block", type: "reactivity_when" },
  ];
}
