export function getBlocks() {
  return [
    {
      kind: "block",
      type: "media_timecode",
    },
    {
      kind: "block",
      type: "media_get_time",
    },
    {
      kind: "block",
      type: "media_get_duration",
    },
    {
      kind: "block",
      type: "media_playing",
    },
  ];
}
