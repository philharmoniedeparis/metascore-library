import { useModule } from "@core/services/module-manager";
import { unref } from "vue";
import { isFunction } from "lodash";
import AbstractInterpreter from "./AbstractInterpreter";

export default class Media extends AbstractInterpreter {
  constructor() {
    super();

    this._previousThen = null;
    this._cuepoint = null;
  }

  getContext() {
    return {
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
      isPlaying: () => {
        const { playing } = useModule("media_player");
        return unref(playing);
      },
      play: (from = null, to = null, then = null) => {
        const { play, pause, seekTo } = useModule("media_player");
        const { setGlobalCuepoint, removeCuepoint } =
          useModule("media_cuepoints");

        if (from !== null || to !== null) {
          this._cuepoint = setGlobalCuepoint({
            startTime: from,
            endTime: to,
            onStart: () => {
              // Execute the previous link's "then" action.
              if (this._previousThen) {
                this._previousThen();
              }

              this._previousThen = then;
            },
            onStop: () => {
              pause();
            },
            onSeekout: ({ cuepoint: c }) => {
              // Remove the cuepoint.
              removeCuepoint(c);
              this._cuepoint = null;

              if (isFunction(then)) {
                then();
                this._previousThen = null;
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

  reset() {
    // Remove cuepoint.
    if (this._cuepoint) {
      const { removeCuepoint } = useModule("media_cuepoints");
      removeCuepoint(this._cuepoint);
    }

    const { pause } = useModule("media_player");
    pause();
  }
}
