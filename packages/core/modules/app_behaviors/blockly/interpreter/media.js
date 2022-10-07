import { useModule } from "@metascore-library/core/services/module-manager";
import { javascriptGenerator as JavaScript } from "blockly/javascript";
import { unref } from "vue";
import { isFunction } from "lodash";

const cuepoints = [];

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
      const { addCuepoint, removeCuepoint } = useModule("media_cuepoints");

      if (from !== null || to !== null) {
        const cuepoint = addCuepoint({
          startTime: from,
          endTime: to,
          onStop: () => {
            pause();
          },
          onSeekout: ({ cuepoint }) => {
            // Remove the cuepoint.
            removeCuepoint(cuepoint);
            const index = cuepoints.findIndex((c) => c === cuepoint);
            if (index > -1) {
              cuepoints.splice(index, 1);
            }

            if (isFunction(then)) {
              then();
            }
          },
        });

        cuepoints.push(cuepoint);

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
  const { pause } = useModule("media_player");
  pause();

  // Remove all cuepoints.
  const { removeCuepoint } = useModule("media_cuepoints");
  while (cuepoints.length > 0) {
    const cuepoint = cuepoints.pop();
    removeCuepoint(cuepoint);
  }
}
