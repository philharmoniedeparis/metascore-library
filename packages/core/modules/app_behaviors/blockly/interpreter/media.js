import { useModule } from "@metascore-library/core/services/module-manager";
import JavaScript from "blockly/javascript";
import { unref } from "vue";

export function init(context) {
  // Ensure 'MediaTime' name does not conflict with variable names.
  JavaScript.addReservedWords("MediaTime");

  // Add 'MediaTime' object to context.
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
    play() {
      const { play } = useModule("media_player");
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
