export const AUTO_HIGHLIGHT_CLASS = "metaScore-auto-highlight";

export function parse(href) {
  let url = null;

  try {
    url = new URL(href, window.location.origin);
  } catch (e) {
    return null;
  }

  if (!(url && /^#/.test(url.hash))) return null;

  const actions = url.hash.replace(/^#/, "").split("&");

  return actions
    .map((action) => {
      if (["play", "pause", "stop"].includes(action)) {
        return {
          type: action,
        };
      }

      let matches = null;

      // play excerpt link.
      if (
        (matches = action.match(
          /^play=(\d*\.?\d+)?,(\d*\.?\d+)?,([^,]+)(?:,([01]))?$/
        ))
      ) {
        return {
          type: "play",
          excerpt: true,
          start: matches[1],
          end: matches[2],
          scenario: decodeURIComponent(matches[3]),
          highlight: matches[4] === "1",
        };
      }

      // seek link.
      if ((matches = action.match(/^seek=(\d*\.?\d+)$/))) {
        return {
          type: "seek",
          time: parseFloat(matches[1]),
        };
      }

      // page link.
      if ((matches = action.match(/^page=([^,]*),(\d+)$/))) {
        return {
          type: "page",
          block: decodeURIComponent(matches[1]),
          index: parseInt(matches[2], 10) - 1,
        };
      }

      // show/hide/toggleBlock link.
      if ((matches = action.match(/^((show|hide|toggle)Block)=(.+)$/))) {
        return {
          type: matches[1],
          name: decodeURIComponent(matches[3]),
        };
      }

      // scenario link.
      if ((matches = action.match(/^scenario=(.+)$/))) {
        return {
          type: "scenario",
          id: decodeURIComponent(matches[1]),
        };
      }

      // enter/exit/toggleFullscreen.
      if ((matches = action.match(/^(enter|exit|toggle)Fullscreen$/))) {
        return {
          type: matches[0],
        };
      }

      return null;
    })
    .filter((action) => action !== null);
}
