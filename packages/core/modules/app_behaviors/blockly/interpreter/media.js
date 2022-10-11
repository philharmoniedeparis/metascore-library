import { useModule } from "@metascore-library/core/services/module-manager";
import { javascriptGenerator as JavaScript } from "blockly/javascript";
import { unref } from "vue";
import { isFunction } from "lodash";

let cuepoint = null;

export function init(context) {
  // Ensure 'Media' name does not conflict with variable names.
  JavaScript.addReservedWords("Media");

  // Add 'Media' object to context.
  context.Media = {
    getDuration: () => {
      const { duration } = useModule("media_player");
      return unref(duration);
    },
    getTime: () => {
      const { time } = useModule("media_player");
      return unref(time);
    },
    setTime: (time) => {
      const { seekTo } = useModule("media_player");
      seekTo(time);
    },
    isPlaying() {
      const { playing } = useModule("media_player");
      return unref(playing);
    },
    play(from = null, to = null, then = null) {
      const { play, pause, seekTo } = useModule("media_player");
      const { setGlobalCuepoint, removeCuepoint } =
        useModule("media_cuepoints");

      if (from !== null || to !== null) {
        cuepoint = setGlobalCuepoint({
          startTime: from,
          endTime: to,
          onStop: () => {
            pause();
          },
          onSeekout: ({ c }) => {
            // Remove the cuepoint.
            removeCuepoint(c);
            cuepoint = null;

            if (isFunction(then)) {
              then();
            }
          },
        });

        if (from !== null) {
          seekTo(from);
        }
      }

      play();
    },
    pause: () => {
      const { pause } = useModule("media_player");
      pause();
    },
    stop: () => {
      const { stop } = useModule("media_player");
      stop();
    },
  };
}

export function reset() {
  // Remove cuepoint.
  if (cuepoint) {
    const { removeCuepoint } = useModule("media_cuepoints");
    removeCuepoint(cuepoint);
  }

  const { pause } = useModule("media_player");
  pause();
}
