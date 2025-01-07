export function getBlocks() {
  return [
    {
      kind: "block",
      type: "controls_if",
      gap: 5,
    },
    {
      kind: "block",
      type: "controls_if",
      extraState: { hasElse: true },
    },
    {
      kind: "block",
      type: "logic_compare",
    },
    {
      kind: "block",
      type: "logic_operation",
    },
    {
      kind: "block",
      type: "logic_negate",
    },
    {
      kind: "block",
      type: "logic_boolean",
    },
  ];
}
