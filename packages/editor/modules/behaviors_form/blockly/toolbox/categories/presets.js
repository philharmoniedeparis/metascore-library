export default function getBlocks() {
  return [
    {
      kind: "block",
      type: "links_click",
      inputs: {
        TRIGGER: { block: { type: "components_behaviour_trigger" } },
        STATEMENT: {
          block: {
            next: {
              block: {
                type: "media_play_excerpt",
                inputs: {
                  TO: {
                    block: { type: "media_timecode" },
                  },
                  FROM: {
                    block: { type: "media_timecode" },
                  },
                  THEN: {
                    block: { type: "components_set_scenario" },
                  },
                },
                extraState: { hasThen: true },
              },
            },
            type: "components_set_scenario",
          },
        },
      },
    },
  ];
}
