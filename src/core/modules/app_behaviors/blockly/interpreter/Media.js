import { javascriptGenerator as JavaScript } from "blockly/javascript";
import { useModule } from "@core/services/module-manager";
import { unref } from "vue";
import { isFunction } from "lodash";
import AbstractInterpreter from "./AbstractInterpreter";

export default class Media extends AbstractInterpreter {
  constructor() {
    super();

    // Ensure context name does not conflict with variable names.
    JavaScript.addReservedWords("Media");

    this._previousThen = null;
    this._cuepoint = null;
  }

  get context() {
    return {
      Media: {
        getDuration: () => {
          const { duration } = useModule("core:media_player");
          return unref(duration);
        },
        getTime: () => {
          const { time } = useModule("core:media_player");
          return unref(time);
        },
        setTime: (time) => {
          const { seekTo } = useModule("core:media_player");
          seekTo(time);
        },
        isPlaying: () => {
          const { playing } = useModule("core:media_player");
          return unref(playing);
        },
        play: (from = null, to = null, then = null) => {
          const { play, pause, seekTo } = useModule("core:media_player");
          const { setGlobalCuepoint, removeCuepoint } =
            useModule("core:media_cuepoints");

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
        exitExcerpt: () => {
          const { getGlobalCuepoint, removeCuepoint } =
            useModule("core:media_cuepoints");

          const cuepoint = getGlobalCuepoint();
          if (cuepoint) removeCuepoint(cuepoint);
        },
        pause: () => {
          const { pause } = useModule("core:media_player");
          pause();
        },
        stop: () => {
          const { stop } = useModule("core:media_player");
          stop();
        },
        getPlaybackRate: () => {
          const { playbackRate } = useModule("core:media_player");
          return unref(playbackRate);
        },
        setPlaybackRate: (value) => {
          const { setPlaybackRate } = useModule("core:media_player");
          setPlaybackRate(value);
        },
      },
    };
  }

  reset() {
    // Remove cuepoint.
    if (this._cuepoint) {
      const { removeCuepoint } = useModule("core:media_cuepoints");
      removeCuepoint(this._cuepoint);
    }

    const { pause, setPlaybackRate } = useModule("core:media_player");
    pause();
    setPlaybackRate(1);
  }
}
